// supabase/functions/publish-post/index.ts
// Validates and publishes an encrypted post. Content is encrypted client-side;
// the server only stores ciphertext and delivery metadata.

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

  const authorId = userData.user.id;

  // Confirm the member is active.
  const { data: member, error: memberError } = await supabase
    .from("membership.members")
    .select("status, must_change_password")
    .eq("id", authorId)
    .single();
  if (memberError || !member || member.status !== "active") {
    return new Response(JSON.stringify({ error: "Account not active" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  // Enforce mandatory password change
  if (member.must_change_password === true) {
    return new Response(
      JSON.stringify({
        error: "Password change required",
        message: "Please change your temporary password before publishing posts.",
        password_change_required: true,
      }),
      { status: 403, headers: corsHeaders },
    );
  }

  let body: {
    audience?: string;
    encrypted_content?: string;
    encrypted_media_reference?: string | null;
    audience_reference?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { audience, encrypted_content, encrypted_media_reference, audience_reference } = body;
  if (!audience || !encrypted_content) {
    return new Response(JSON.stringify({ error: "Audience and encrypted content are required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { data: post, error: postError } = await supabase
    .from("social.posts")
    .insert({
      author_id: authorId,
      audience,
      encryption_version: 1,
      encrypted_content,
      encrypted_media_reference: encrypted_media_reference ?? null,
      audience_reference: audience_reference ?? null,
    })
    .select()
    .single();

  if (postError) {
    return new Response(JSON.stringify({ error: postError.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Audit log.
  await supabase.from("administration.audit_logs").insert({
    actor_id: authorId,
    action: "publish-post",
    target_type: "post",
    target_id: post.id,
    metadata: { audience },
  });

  return new Response(
    JSON.stringify({ post: { id: post.id, created_at: post.created_at } }),
    { headers: corsHeaders },
  );
});
