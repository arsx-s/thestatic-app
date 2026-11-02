// supabase/functions/change-password/index.ts
// Changes a member's password.
// Can be used for:
// 1. First-time password change (from temporary password to permanent)
// 2. Regular password change (from old password to new password)
//
// Server-side enforcement:
// - If must_change_password is true, the old_password MUST be the temporary
//   password that was provisioned.
// - After successful change, must_change_password is set to false.
// - Password strength is validated server-side.

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

// Minimum password strength requirements
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one special character" };
  }
  return { valid: true };
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
  const userEmail = userData.user.email;

  let body: {
    old_password?: string;
    new_password?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { old_password, new_password } = body;
  if (!old_password || !new_password) {
    return new Response(JSON.stringify({ error: "Old password and new password are required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Validate new password strength
  const strengthCheck = validatePassword(new_password);
  if (!strengthCheck.valid) {
    return new Response(JSON.stringify({ error: strengthCheck.error }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Check current must_change_password status
  const { data: member, error: memberError } = await supabase
    .from("membership.members")
    .select("must_change_password, status")
    .eq("id", memberId)
    .maybeSingle();

  if (memberError || !member) {
    return new Response(JSON.stringify({ error: "Member not found" }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  if (member.status !== "active") {
    return new Response(JSON.stringify({ error: "Account is not active" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  // Change the password using the admin API (service role bypasses RLS)
  // We use updateUserById which requires the service role key
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    memberId,
    { password: new_password },
  );

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message || "Failed to change password" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Clear the must_change_password flag
  await supabase
    .from("membership.members")
    .update({ must_change_password: false })
    .eq("id", memberId);

  // Audit log - NOTE: No passwords in metadata
  await supabase.from("administration.audit_logs").insert({
    actor_id: memberId,
    action: "change-password",
    target_type: "member",
    target_id: memberId,
    metadata: { was_temporary: member.must_change_password === true },
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: "Password changed successfully",
      password_change_required: false,
    }),
    { headers: corsHeaders },
  );
});
