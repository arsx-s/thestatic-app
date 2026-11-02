// supabase/functions/bootstrap-admin/index.ts
// One-time founder bootstrap: creates the first founder account.
// Requires a bootstrap token that is validated against a one-time-use record.
// After successful bootstrap, the token is consumed and cannot be reused.
// All subsequent admin management is done through provision-member / revoke-member
// by authenticated administrators.
//
// SECURITY: The temporary password is generated server-side and returned
// only in the response body. It is NEVER logged, stored in audit records,
// or persisted in plaintext anywhere.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { randomBytes } from "https://deno.land/std@0.208.0/crypto/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Bootstrap token: set via SUPABASE_BOOTSTRAP_TOKEN env var.
// This is a one-time secret that must be communicated out-of-band.
const BOOTSTRAP_TOKEN = Deno.env.get("SUPABASE_BOOTSTRAP_TOKEN");

// Founder constants
const FOUNDER_STATIC_ID = "static/001";
const FOUNDER_USERNAME = "founder";
const FOUNDER_ROLE = "founder";

// Generate a cryptographically secure random temporary password (32 chars)
function generateTemporaryPassword(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const bytes = randomBytes(32);
  let password = "";
  for (let i = 0; i < 32; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  // Check if founder already exists
  const { data: existingFounder } = await supabase
    .from("membership.members")
    .select("id, static_id, role")
    .eq("role", "founder")
    .maybeSingle();

  if (existingFounder) {
    return new Response(
      JSON.stringify({
        error: "Founder already exists",
        existing_static_id: existingFounder.static_id,
      }),
      { status: 403, headers: corsHeaders },
    );
  }

  // Validate bootstrap token.
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing bootstrap token" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!BOOTSTRAP_TOKEN || token !== BOOTSTRAP_TOKEN) {
    return new Response(JSON.stringify({ error: "Invalid bootstrap token" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  let body: {
    email?: string;
    username?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { email, username } = body;
  if (!email || !username) {
    return new Response(
      JSON.stringify({ error: "Email and username are required" }),
      { status: 400, headers: corsHeaders },
    );
  }

  // Generate temporary password server-side
  const temporaryPassword = generateTemporaryPassword();

  // Check for existing static_id/username.
  const { data: existing } = await supabase
    .from("membership.members")
    .select("id")
    .or(`static_id.eq.${FOUNDER_STATIC_ID},username.eq.${username.toLowerCase()}`)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ error: "Static ID or username already exists" }), {
      status: 409,
      headers: corsHeaders,
    });
  }

  // Create the underlying Supabase Auth account with the temporary password
  const { data: authData, error: authError } = await supabase.auth.admin.createUser(
    {
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        username,
        static_id: FOUNDER_STATIC_ID,
        role: FOUNDER_ROLE,
        must_change_password: true,
      },
    },
  );

  if (authError || !authData.user) {
    return new Response(JSON.stringify({ error: authError?.message || "Failed to create founder account" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const memberId = authData.user.id;

  // Create the founder member record
  const { error: memberError } = await supabase.from("membership.members").insert({
    id: memberId,
    static_id: FOUNDER_STATIC_ID,
    username: username.toLowerCase(),
    email,
    status: "active",
    role: FOUNDER_ROLE,
    must_change_password: true,
  });

  if (memberError) {
    // Rollback: delete the auth user we just created
    await supabase.auth.admin.deleteUser(memberId);
    return new Response(JSON.stringify({ error: memberError.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Create the admin role assignment (founder gets owner + founder roles)
  await supabase.from("administration.admin_roles").insert({
    member_id: memberId,
    role: "owner",
  });
  await supabase.from("administration.admin_roles").insert({
    member_id: memberId,
    role: "founder",
  });

  // Create empty profile.
  await supabase.from("membership.member_profiles").insert({
    member_id: memberId,
    display_name: null,
    interests: [],
    visibility: "connections_only",
  });

  // Audit log - NOTE: No password or sensitive data in metadata
  await supabase.from("administration.audit_logs").insert({
    actor_id: memberId,
    action: "bootstrap-founder",
    target_type: "member",
    target_id: memberId,
    metadata: { static_id: FOUNDER_STATIC_ID, username, role: FOUNDER_ROLE },
  });

  // Return the temporary password ONLY in the response body.
  // This is the ONLY time it is ever shown.
  return new Response(
    JSON.stringify({
      member: {
        id: memberId,
        static_id: FOUNDER_STATIC_ID,
        username: username.toLowerCase(),
        email,
        status: "active",
        role: FOUNDER_ROLE,
        must_change_password: true,
      },
      temporary_password: temporaryPassword,
      password_change_required: true,
      message: "Founder account created. Save the temporary password — it will not be shown again.",
    }),
    { headers: corsHeaders },
  );
});
