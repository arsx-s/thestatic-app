// supabase/functions/create-listing/index.ts
// Validates and creates a Marketplace listing.
// Content is encrypted client-side; the server stores ciphertext and delivery metadata.

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

const ALLOWED_CATEGORIES = [
  "Electronics",
  "Computers",
  "Gaming",
  "Sneakers",
  "Fashion",
  "Collectibles",
  "Art",
  "Accessories",
  "Other",
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

  const sellerId = userData.user.id;

  // Confirm the member is active.
  const { data: member, error: memberError } = await supabase
    .from("membership.members")
    .select("status, must_change_password")
    .eq("id", sellerId)
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
        message: "Please change your temporary password before creating listings.",
        password_change_required: true,
      }),
      { status: 403, headers: corsHeaders },
    );
  }

  let body: {
    category?: string;
    encrypted_listing?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { category, encrypted_listing } = body;
  if (!category || !encrypted_listing) {
    return new Response(JSON.stringify({ error: "Category and encrypted listing are required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return new Response(JSON.stringify({ error: "Invalid category" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { data: listing, error: listingError } = await supabase
    .from("commerce.marketplace_listings")
    .insert({
      seller_id: sellerId,
      category,
      encrypted_listing,
    })
    .select()
    .single();

  if (listingError) {
    return new Response(JSON.stringify({ error: listingError.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Audit log.
  await supabase.from("administration.audit_logs").insert({
    actor_id: sellerId,
    action: "create-listing",
    target_type: "listing",
    target_id: listing.id,
    metadata: { category },
  });

  return new Response(
    JSON.stringify({ listing: { id: listing.id, created_at: listing.created_at } }),
    { headers: corsHeaders },
  );
});
