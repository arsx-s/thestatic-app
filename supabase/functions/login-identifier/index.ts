// supabase/functions/login-identifier/index.ts
// Resolves a Static ID or username to the member's email so the client can
// complete Supabase Auth signInWithPassword. No password is verified here;
// password verification is performed by Supabase Auth.
// Rate limiting and enumeration mitigation must be enforced at the API
// gateway / edge layer in addition to this function.

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

  let body: { identifier?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { identifier } = body;
  if (!identifier || typeof identifier !== "string") {
    // Constant-shape response to avoid enumeration at the HTTP status level.
    return new Response(JSON.stringify({ email: null }), { headers: corsHeaders });
  }

  const isStaticId = /^(ST-\d{5}|static/\d{3})$/.test(identifier.trim());
  const column = isStaticId ? "static_id" : "username";
  const value = isStaticId ? identifier.trim() : identifier.trim().toLowerCase();

  const { data: member, error } = await supabase
    .from("membership.members")
    .select("id, static_id, username, email, status, role")
    .filter(column, "eq", value)
    .single();

  if (error || !member) {
    return new Response(JSON.stringify({ email: null }), { headers: corsHeaders });
  }

  if (member.status !== "active") {
    return new Response(JSON.stringify({ email: null }), { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({
      email: member.email,
      member: {
        id: member.id,
        static_id: member.static_id,
        username: member.username,
        status: member.status,
        role: member.role,
      },
    }),
    { headers: corsHeaders },
  );
});
