export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400 });
  }
  // In production, this would verify against Supabase Auth and check admin_roles
  // For now, return unauthorized - admin needs to be bootstrapped first
  return new Response(JSON.stringify({ error: "Admin not yet bootstrapped. Run admin bootstrap first." }), { status: 401 });
}
