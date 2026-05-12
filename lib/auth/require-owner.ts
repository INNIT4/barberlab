import { getCurrentOrg } from "@/lib/auth/current-user";

export async function requireOwner(): Promise<{ error: string } | null> {
  const { role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede realizar esta acción" };
  return null;
}
