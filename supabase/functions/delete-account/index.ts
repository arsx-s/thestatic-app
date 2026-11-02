// supabase/functions/delete-account/index.ts
// Processes account deletion for a member.
// Revokes all devices, marks member as removed, and cascades deletions.
// Only the member themselves can delete their own account.

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

  const memberId = userData.user.id;

  // Confirm the member exists and is not already removed.
  const { data: member, error: memberError } = await supabase
    .from("membership.members")
    .select("status")
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    return new Response(JSON.stringify({ error: "Member not found" }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  if (member.status === "removed") {
    return new Response(JSON.stringify({ error: "Account already removed" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Revoke all devices for this member.
  await supabase
    .from("identity.member_devices")
    .update({ status: "revoked" })
    .eq("member_id", memberId);

  // Mark member as removed.
  await supabase
    .from("membership.members")
    .update({ status: "removed" })
    .eq("id", memberId);

  // Delete the underlying Supabase Auth account.
  await supabase.auth.admin.deleteUser(memberId);

  // Audit log.
  await supabase.from("administration.audit_logs").insert({
    actor_id: memberId,
    action: "delete-account",
    target_type: "member",
    target_id: memberId,
    metadata: {},
  });

  return new Response(
    JSON.stringify({ success: true, message: "Account deleted" }),
    { headers: corsHeaders },
  );
});
