// supabase/functions/submit-report/index.ts
// Submits a moderation report for content or a member.
// Evidence is encrypted client-side; the server stores ciphertext only.

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

const ALLOWED_TARGET_TYPES = [
  "post",
  "story",
  "message",
  "listing",
  "member",
  "event",
];

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

  const reporterId = userData.user.id;

  // Confirm the member is active.
  const { data: member, error: memberError } = await supabase
    .from("membership.members")
    .select("status")
    .eq("id", reporterId)
    .single();
  if (memberError || !member || member.status !== "active") {
    return new Response(JSON.stringify({ error: "Account not active" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  let body: {
    target_type?: string;
    target_id?: string;
    encrypted_evidence?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { target_type, target_id, encrypted_evidence } = body;
  if (!target_type || !target_id) {
    return new Response(JSON.stringify({ error: "target_type and target_id are required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (!ALLOWED_TARGET_TYPES.includes(target_type)) {
    return new Response(JSON.stringify({ error: "Invalid target_type" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { data: report, error: reportError } = await supabase
    .from("administration.moderation_reports")
    .insert({
      reporter_id: reporterId,
      target_type,
      target_id,
      encrypted_evidence: encrypted_evidence ?? null,
    })
    .select()
    .single();

  if (reportError) {
    return new Response(JSON.stringify({ error: reportError.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Audit log.
  await supabase.from("administration.audit_logs").insert({
    actor_id: reporterId,
    action: "submit-report",
    target_type: "report",
    target_id: report.id,
    metadata: { target_type, target_id },
  });

  return new Response(
    JSON.stringify({ report: { id: report.id, status: report.status, created_at: report.created_at } }),
    { headers: corsHeaders },
  );
});
