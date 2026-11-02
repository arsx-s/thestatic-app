import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("thestatic:admin:session")?.value;
  if (!token) {
    redirect("/admin/login");
  }
  // Only create admin client if env vars are available (build-time safety)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect("/admin/login");
  }
  const { createAdminClient } = await import("@/lib/admin");
  const supabase = createAdminClient();
  const { data } = await supabase.auth.getUser(token);
  if (!data.user) {
    redirect("/admin/login");
  }
  redirect("/admin/dashboard");
}
