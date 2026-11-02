// supabase/functions/provision-member/index.ts
// Admin-only: creates an approved member account and provisions a Static ID.
// Called from the admin dashboard. Requires service-role credentials.

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

  // Authorize caller (admin role check performed by middleware; here we trust
  // the Bearer JWT and assert admin role via admin_roles table).
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
    .from("admin_roles")
    .select("role")
    .eq("member_id", actorId)
    .in("role", ["owner", "super_admin", "membership_admin"])
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
    password?: string;
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

  const { email, username, password, static_id, display_name } = body;
  if (!email || !username || !password) {
    return new Response(
      JSON.stringify({ error: "Email, username and password are required" }),
      { status: 400, headers: corsHeaders },
    );
  }

  const finalStaticId = static_id || nextStaticId();

  // Create the underlying Supabase Auth account (email confirmed).
  const { data: authData, error: authError } = await supabase.auth.admin.createUser(
    {
      email,
      password,
      email_confirm: true,
      user_metadata: { username, static_id: finalStaticId },
    },
  );

  if (authError || !authData.user) {
    return new Response(JSON.stringify({ error: authError?.message || "Failed to create account" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const memberId = authData.user.id;

  // Create the member record.
  const { error: memberError } = await supabase.from("members").insert({
    id: memberId,
    static_id: finalStaticId,
    username: username.toLowerCase(),
    email,
    password_hash: "", // managed by Supabase Auth; not stored here
    status: "active",
    role: "member",
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
  await supabase.from("member_profiles").insert({
    member_id: memberId,
    display_name: display_name || null,
    interests: [],
    visibility: "connections_only",
  });

  // Audit log.
  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action: "provision-member",
    target_type: "member",
    target_id: memberId,
    metadata: { static_id: finalStaticId, username },
  });

  return new Response(
    JSON.stringify({
      member: {
        id: memberId,
        static_id: finalStaticId,
        username,
        email,
        status: "active",
        role: "member",
      },
    }),
    { headers: corsHeaders },
  );
});
