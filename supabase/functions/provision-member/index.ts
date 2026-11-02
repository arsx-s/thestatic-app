// supabase/functions/provision-member/index.ts
// Admin-only: creates an approved member account and provisions a Static ID.
// Called from the admin dashboard. Requires service-role credentials.
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

function nextStaticId(prefix = "ST-"): string {
  return `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;
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

  // Authorize caller
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const actorId = userData.user.id;
  const { data: roleRow } = await supabase
    .from("administration.admin_roles")
    .select("role")
    .eq("member_id", actorId)
    .in("role", ["owner", "super_admin", "membership_admin", "founder"])
    .maybeSingle();

  if (!roleRow) {
    return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  let body: {
    email?: string;
    username?: string;
    static_id?: string;
    display_name?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { email, username, static_id, display_name } = body;
  if (!email || !username) {
    return new Response(
      JSON.stringify({ error: "Email and username are required" }),
      { status: 400, headers: corsHeaders },
    );
  }

  const finalStaticId = static_id || nextStaticId();

  // Generate temporary password server-side
  const temporaryPassword = generateTemporaryPassword();

  // Check for existing static_id/username.
  const { data: existing } = await supabase
    .from("membership.members")
    .select("id")
    .or(`static_id.eq.${finalStaticId},username.eq.${username.toLowerCase()}`)
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
        static_id: finalStaticId,
        role: "member",
        must_change_password: true,
      },
    },
  );

  if (authError || !authData.user) {
    return new Response(JSON.stringify({ error: authError?.message || "Failed to create account" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const memberId = authData.user.id;

  // Create the member record with must_change_password = true
  const { error: memberError } = await supabase.from("membership.members").insert({
    id: memberId,
    static_id: finalStaticId,
    username: username.toLowerCase(),
    email,
    status: "active",
    role: "member",
    must_change_password: true,
  });

  if (memberError) {
    // Rollback: delete the auth user we just created.
    await supabase.auth.admin.deleteUser(memberId);
    return new Response(JSON.stringify({ error: memberError.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Create an empty profile.
  await supabase.from("membership.member_profiles").insert({
    member_id: memberId,
    display_name: display_name || null,
    interests: [],
    visibility: "connections_only",
  });

  // Audit log - NOTE: No password in metadata
  await supabase.from("administration.audit_logs").insert({
    actor_id: actorId,
    action: "provision-member",
    target_type: "member",
    target_id: memberId,
    metadata: { static_id: finalStaticId, username, must_change_password: true },
  });

  // Return the temporary password ONLY in the response body.
  // This is the ONLY time it is ever shown.
  return new Response(
    JSON.stringify({
      member: {
        id: memberId,
        static_id: finalStaticId,
        username: username.toLowerCase(),
        email,
        status: "active",
        role: "member",
        must_change_password: true,
      },
      temporary_password: temporaryPassword,
      password_change_required: true,
      message: "Member account created. Provide the temporary password to the member — it will not be shown again.",
    }),
    { headers: corsHeaders },
  );
});
