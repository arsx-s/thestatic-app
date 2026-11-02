// supabase/functions/register-event/index.ts
// Registers a member for an event.
// Enforces capacity limits and registration deadlines.

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
    event_id?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { event_id } = body;
  if (!event_id) {
    return new Response(JSON.stringify({ error: "event_id is required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Fetch the event.
  const { data: event, error: eventError } = await supabase
    .from("events.events")
    .select("*")
    .eq("id", event_id)
    .single();

  if (eventError || !event) {
    return new Response(JSON.stringify({ error: "Event not found" }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  if (event.status !== "published") {
    return new Response(JSON.stringify({ error: "Event is not published" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  // Check registration deadline.
  if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
    return new Response(JSON.stringify({ error: "Registration deadline has passed" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  // Check for existing registration.
  const { data: existing } = await supabase
    .from("events.event_registrations")
    .select("id")
    .eq("event_id", event_id)
    .eq("member_id", memberId)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ error: "Already registered for this event" }), {
      status: 409,
      headers: corsHeaders,
    });
  }

  // Check capacity.
  if (event.capacity) {
    const { count, error: countError } = await supabase
      .from("events.event_registrations")
      .select("*", { head: true, count: "exact" })
      .eq("event_id", event_id)
      .eq("status", "approved");

    if (countError) {
      return new Response(JSON.stringify({ error: countError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (count !== null && count >= event.capacity) {
      return new Response(JSON.stringify({ error: "Event is at capacity" }), {
        status: 403,
        headers: corsHeaders,
      });
    }
  }

  const { data: registration, error: regError } = await supabase
    .from("events.event_registrations")
    .insert({
      event_id,
      member_id: memberId,
      status: "pending",
    })
    .select()
    .single();

  if (regError) {
    return new Response(JSON.stringify({ error: regError.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Audit log.
  await supabase.from("administration.audit_logs").insert({
    actor_id: memberId,
    action: "register-event",
    target_type: "registration",
    target_id: registration.id,
    metadata: { event_id },
  });

  return new Response(
    JSON.stringify({ registration: { id: registration.id, status: registration.status, created_at: registration.created_at } }),
    { headers: corsHeaders },
  );
});
