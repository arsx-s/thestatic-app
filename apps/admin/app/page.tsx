import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("thestatic:admin:session")?.value;
  if (!token) {
    redirect("/login");
  }
  // Validate session server-side.
  const supabase = createAdminClient();
  const { data } = await supabase.auth.getUser(token);
  if (!data.user) {
    redirect("/login");
  }
  redirect("/dashboard");
}
