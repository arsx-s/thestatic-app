// supabase/functions/register-device/index.ts
// Registers a member's cryptographic device identity (public keys) after login.
// Called by the mobile app on first launch / device registration.

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
  let body: {
    name?: string;
    platform?: "ios" | "android" | "web";
    identity_public_key?: string;
    device_public_key?: string;
    push_token?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { name, platform, identity_public_key, device_public_key, push_token } = body;

  const { data: device, error: deviceError } = await supabase
    .from("member_devices")
    .insert({
      member_id: memberId,
      name: name ?? null,
      platform: platform ?? "web",
      status: "active",
      identity_public_key: identity_public_key ?? null,
      device_public_key: device_public_key ?? null,
      last_seen_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (deviceError) {
    return new Response(JSON.stringify({ error: deviceError.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Store push token if provided.
  if (push_token) {
    await supabase.from("push_tokens").upsert({
      member_id: memberId,
      token: push_token,
      platform: platform ?? "web",
      updated_at: new Date().toISOString(),
    }, { onConflict: "member_id,platform" });
  }

  // Audit log.
  await supabase.from("audit_logs").insert({
    actor_id: memberId,
    action: "register-device",
    target_type: "device",
    target_id: device.id,
    metadata: { platform, name },
  });

  return new Response(
    JSON.stringify({ device: { id: device.id, status: device.status } }),
    { headers: corsHeaders },
  );
});
