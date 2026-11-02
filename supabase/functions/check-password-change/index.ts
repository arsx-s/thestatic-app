// supabase/functions/check-password-change/index.ts
// Checks whether the authenticated member must change their password.
// Called by the frontend after login to determine if a password-change
// screen should be shown.
// Enforced server-side: returns must_change_password from the members table.

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
  if (req.method !== "GET") {
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

  // Check must_change_password from the members table (server-side truth)
  const { data: member, error: memberError } = await supabase
    .from("membership.members")
    .select("must_change_password, role, static_id, username, status")
    .eq("id", memberId)
    .maybeSingle();

  if (memberError || !member) {
    return new Response(JSON.stringify({ error: "Member not found" }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  return new Response(
    JSON.stringify({
      must_change_password: member.must_change_password === true,
      role: member.role,
      static_id: member.static_id,
      username: member.username,
      status: member.status,
    }),
    { headers: corsHeaders },
  );
});
