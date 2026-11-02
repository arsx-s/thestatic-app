import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("thestatic:admin:session")?.value;
  if (!token) return null;
  const supabase = createAdminClient();
  const { data } = await supabase.auth.getUser(token);
  if (!data?.user) return null;
  const { data: roleRow } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("member_id", data.user.id)
    .maybeSingle();
  return roleRow ? { user: data.user, role: roleRow.role } : null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("moderation_reports")
    .select("id, target_type, target_id, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reports: data ?? [] });
}
