import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  // Use service-role client to verify credentials without exposing them.
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Verify admin role.
  const { data: roleRow } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("member_id", data.user.id)
    .maybeSingle();
  if (!roleRow) {
    return NextResponse.json({ error: "Not an administrator" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set("thestatic:admin:session", data.session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ ok: true });
}
