import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ROLE_VALUES = [
  "guest", "group_host", "corp_admin", "frontdesk",
  "provider", "restaurant", "manager", "admin", "owner",
] as const;
type AppRole = (typeof ROLE_VALUES)[number];

interface CreateUserInput {
  email: string;
  password?: string;
  fullName?: string;
  roles?: AppRole[];
  sendInvite?: boolean;
}

function validate(input: any): CreateUserInput {
  if (!input || typeof input !== "object") throw new Error("Invalid input");
  const email = String(input.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Valid email required");
  const password = input.password ? String(input.password) : undefined;
  if (password && password.length < 6) throw new Error("Password must be at least 6 characters");
  const fullName = input.fullName ? String(input.fullName).trim().slice(0, 100) : undefined;
  const roles = Array.isArray(input.roles)
    ? input.roles.filter((r: any) => ROLE_VALUES.includes(r)) as AppRole[]
    : [];
  return { email, password, fullName, roles, sendInvite: !!input.sendInvite };
}

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Authorization: caller must be admin or owner
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" as any });
    const { data: isOwner } = await supabase.rpc("has_role", { _user_id: userId, _role: "owner" as any });
    if (!isAdmin && !isOwner) throw new Error("Forbidden");

    // Owner-only roles
    const requestsPrivileged = (data.roles || []).some((r) => r === "admin" || r === "owner");
    if (requestsPrivileged && !isOwner) throw new Error("Only owners can grant admin or owner roles");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let newUserId: string | null = null;

    if (data.sendInvite) {
      const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
        data: data.fullName ? { full_name: data.fullName } : undefined,
      });
      if (error) throw new Error(error.message);
      newUserId = invited.user?.id || null;
    } else {
      const password = data.password || (crypto.randomUUID() + "Aa1!");
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password,
        email_confirm: true,
        user_metadata: data.fullName ? { full_name: data.fullName } : undefined,
      });
      if (error) throw new Error(error.message);
      newUserId = created.user?.id || null;
    }

    if (!newUserId) throw new Error("User creation returned no id");

    // Assign additional roles beyond default 'guest' (created by handle_new_user trigger)
    const extraRoles = (data.roles || []).filter((r) => r !== "guest");
    if (extraRoles.length > 0) {
      const rows = extraRoles.map((role) => ({ user_id: newUserId, role }));
      const { error: rolesError } = await supabaseAdmin
        .from("user_roles")
        .upsert(rows, { onConflict: "user_id,role" });
      if (rolesError) throw new Error(`User created but role assignment failed: ${rolesError.message}`);
    }

    return { id: newUserId, email: data.email, invited: !!data.sendInvite };
  });
