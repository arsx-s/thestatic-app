// supabase/functions/create-order/index.ts
// Creates a Store order for a member.
// Payment is handled externally; this function records the order pending payment confirmation.

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

  // Confirm the member is active.
  const { data: member, error: memberError } = await supabase
    .from("membership.members")
    .select("status")
    .eq("id", memberId)
    .single();
  if (memberError || !member || member.status !== "active") {
    return new Response(JSON.stringify({ error: "Account not active" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  let body: {
    total_bdt?: number;
    payment_reference?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { total_bdt, payment_reference } = body;
  if (!total_bdt || total_bdt <= 0) {
    return new Response(JSON.stringify({ error: "Valid total_bdt is required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { data: order, error: orderError } = await supabase
    .from("commerce.store_orders")
    .insert({
      member_id: memberId,
      status: "pending",
      total_bdt,
      payment_reference: payment_reference ?? null,
    })
    .select()
    .single();

  if (orderError) {
    return new Response(JSON.stringify({ error: orderError.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Audit log.
  await supabase.from("administration.audit_logs").insert({
    actor_id: memberId,
    action: "create-order",
    target_type: "order",
    target_id: order.id,
    metadata: { total_bdt },
  });

  return new Response(
    JSON.stringify({ order: { id: order.id, status: order.status, created_at: order.created_at } }),
    { headers: corsHeaders },
  );
});
