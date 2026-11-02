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
    .from("applications")
    .select("id, status, created_at, member_id, members!inner (static_id, username)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data ?? [] });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const supabase = createAdminClient();
  const { error } = await supabase.from("applications").update({ status, reviewed_by: admin.user.id, reviewed_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("audit_logs").insert({ actor_id: admin.user.id, action: "review-application", target_type: "application", target_id: id, metadata: { status } });
  return NextResponse.json({ ok: true });
}
