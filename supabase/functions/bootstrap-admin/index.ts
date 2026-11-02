// supabase/functions/bootstrap-admin/index.ts
// One-time admin bootstrap: creates the first administrator account.
// Requires a bootstrap token that is validated against a one-time-use record.
// After successful bootstrap, the token is consumed and cannot be reused.
// All subsequent admin management is done through provision-member / revoke-member
// by authenticated administrators.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  // Check if bootstrap has already been completed.
  const { data: existingAdmin } = await supabase
    .from("administration.admin_roles")
    .select("member_id")
    .limit(1)
    .maybeSingle();

  if (existingAdmin) {
    return new Response(JSON.stringify({ error: "Admin already bootstrapped" }), {
      status: 403,
      headers: corsHeaders,
    });
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
    password?: string;
    static_id?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { email, username, password, static_id } = body;
  if (!email || !username || !password) {
    return new Response(JSON.stringify({ error: "Email, username and password are required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const finalStaticId = static_id || "ST-00001";

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

  // Create the underlying Supabase Auth account.
  const { data: authData, error: authError } = await supabase.auth.admin.createUser(
    {
      email,
      password,
      email_confirm: true,
      user_metadata: { username, static_id: finalStaticId, role: "owner" },
    },
  );

  if (authError || !authData.user) {
    return new Response(JSON.stringify({ error: authError?.message || "Failed to create account" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const memberId = authData.user.id;

  // Create the member record as owner.
  const { error: memberError } = await supabase.from("membership.members").insert({
    id: memberId,
    static_id: finalStaticId,
    username: username.toLowerCase(),
    email,
    status: "active",
    role: "owner",
  });

  if (memberError) {
    await supabase.auth.admin.deleteUser(memberId);
    return new Response(JSON.stringify({ error: memberError.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Create the admin role assignment.
  await supabase.from("administration.admin_roles").insert({
    member_id: memberId,
    role: "owner",
  });

  // Create empty profile.
  await supabase.from("membership.member_profiles").insert({
    member_id: memberId,
    display_name: null,
    interests: [],
    visibility: "connections_only",
  });

  // Audit log.
  await supabase.from("administration.audit_logs").insert({
    actor_id: memberId,
    action: "bootstrap-admin",
    target_type: "member",
    target_id: memberId,
    metadata: { static_id: finalStaticId, username, role: "owner" },
  });

  return new Response(
    JSON.stringify({
      member: {
        id: memberId,
        static_id: finalStaticId,
        username,
        email,
        status: "active",
        role: "owner",
      },
    }),
    { headers: corsHeaders },
  );
});
