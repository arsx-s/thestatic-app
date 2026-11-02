// supabase/functions/send-message/index.ts
// Validates and stores an encrypted direct message.
// Content is encrypted client-side; the server only stores ciphertext and routing metadata.
// Sender must be a participant in the conversation.

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

  const senderId = userData.user.id;

  let body: {
    conversation_id?: string;
    sender_device_id?: string;
    ciphertext?: string;
    protocol_version?: number;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { conversation_id, sender_device_id, ciphertext, protocol_version } = body;
  if (!conversation_id || !sender_device_id || !ciphertext) {
    return new Response(
      JSON.stringify({ error: "conversation_id, sender_device_id and ciphertext are required" }),
      { status: 400, headers: corsHeaders },
    );
  }

  // Verify sender is a participant in the conversation.
  const { data: membership, error: memberError } = await supabase
    .from("messaging.conversation_members")
    .select("member_id")
    .eq("conversation_id", conversation_id)
    .eq("member_id", senderId)
    .maybeSingle();

  if (memberError || !membership) {
    return new Response(JSON.stringify({ error: "Not a participant in this conversation" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  // Verify the sender device belongs to this member.
  const { data: device, error: deviceError } = await supabase
    .from("identity.member_devices")
    .select("member_id")
    .eq("id", sender_device_id)
    .single();

  if (deviceError || !device || device.member_id !== senderId) {
    return new Response(JSON.stringify({ error: "Sender device does not belong to this member" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  const { data: message, error: messageError } = await supabase
    .from("messaging.encrypted_messages")
    .insert({
      conversation_id,
      sender_device_id,
      ciphertext,
      protocol_version: protocol_version ?? 1,
    })
    .select()
    .single();

  if (messageError) {
    return new Response(JSON.stringify({ error: messageError.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Update conversation updated_at.
  await supabase
    .from("messaging.conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversation_id);

  // Audit log.
  await supabase.from("administration.audit_logs").insert({
    actor_id: senderId,
    action: "send-message",
    target_type: "message",
    target_id: message.id,
    metadata: { conversation_id },
  });

  return new Response(
    JSON.stringify({ message: { id: message.id, created_at: message.created_at } }),
    { headers: corsHeaders },
  );
});
