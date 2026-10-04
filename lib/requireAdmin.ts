import { supabaseAdmin } from "./supabaseAdmin";

/** Token se user nikalo, aur check karo ki wo admin hai ya nahi */
export async function requireAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const { data } = await supabaseAdmin.auth.getUser(token);
  if (!data.user) return null;

  const { data: p } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  return p?.role === "admin" ? data.user : null;
}