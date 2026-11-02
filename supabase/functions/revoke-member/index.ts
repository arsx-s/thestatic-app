// supabase/functions/revoke-member/index.ts
// Admin-only: suspends or restores a member account.
// Revokes all devices when suspending. Only authorized admins can perform this action.

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

const ADMIN_ROLES = ["owner", "super_admin", "membership_admin", "founder"];

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

  // Verify admin role.
  const { data: roleRow } = await supabase
    .from("administration.admin_roles")
    .select("role")
    .eq("member_id", actorId)
    .in("role", ADMIN_ROLES)
    .maybeSingle();

  if (!roleRow) {
    return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  // Enforce mandatory password change for the acting admin
  const { data: actorMember, error: actorMemberError } = await supabase
    .from("membership.members")
    .select("must_change_password, status")
    .eq("id", actorId)
    .maybeSingle();

  if (actorMemberError || !actorMember || actorMember.status !== "active") {
    return new Response(JSON.stringify({ error: "Account not active" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  if (actorMember.must_change_password === true) {
    return new Response(
      JSON.stringify({
        error: "Password change required",
        message: "Please change your temporary password before using admin functions.",
        password_change_required: true,
      }),
      { status: 403, headers: corsHeaders },
    );
  }

  let body: {
    target_member_id?: string;
    status?: "suspended" | "active";
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { target_member_id, status } = body;
  if (!target_member_id || !status) {
    return new Response(JSON.stringify({ error: "target_member_id and status are required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (!["suspended", "active"].includes(status)) {
    return new Response(JSON.stringify({ error: "status must be 'suspended' or 'active'" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Cannot revoke yourself.
  if (target_member_id === actorId) {
    return new Response(JSON.stringify({ error: "Cannot modify your own account" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  // Fetch the target member.
  const { data: targetMember, error: memberError } = await supabase
    .from("membership.members")
    .select("status")
    .eq("id", target_member_id)
    .single();

  if (memberError || !targetMember) {
    return new Response(JSON.stringify({ error: "Target member not found" }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  // Revoke all devices if suspending.
  if (status === "suspended") {
    await supabase
      .from("identity.member_devices")
      .update({ status: "revoked" })
      .eq("member_id", target_member_id);
  }

  // Update member status.
  const { error: updateError } = await supabase
    .from("membership.members")
    .update({ status })
    .eq("id", target_member_id);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Audit log.
  await supabase.from("administration.audit_logs").insert({
    actor_id: actorId,
    action: "revoke-member",
    target_type: "member",
    target_id: target_member_id,
    metadata: { status },
  });

  return new Response(
    JSON.stringify({ success: true, member_id: target_member_id, status }),
    { headers: corsHeaders },
  );
});
