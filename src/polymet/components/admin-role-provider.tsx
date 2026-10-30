import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  ADMIN_ROLES,
  type AdminRoleDefinition,
  type AdminRoleId,
  type Permission,
} from "@/polymet/data/admin-roles";

interface AdminRoleContextValue {
  role: AdminRoleDefinition;
  setRoleId: (id: AdminRoleId) => void;
  can: (permission?: Permission) => boolean;
}

const defaultRole = ADMIN_ROLES[0];

const AdminRoleContext = createContext<AdminRoleContextValue>({
  role: defaultRole,
  setRoleId: () => undefined,
  can: (permission) => !permission || defaultRole.permissions.includes(permission),
});

/**
 * Client-side permission context used only to shape the UI.
 * The backend must enforce every permission independently.
 */
export function AdminRoleProvider({
  children,
  initialRole = "super_admin",
}: {
  children: ReactNode;
  initialRole?: AdminRoleId;
}) {
  const [roleId, setRoleId] = useState<AdminRoleId>(initialRole);
  const value = useMemo(() => {
    const role = ADMIN_ROLES.find((r) => r.id === roleId) ?? defaultRole;
    return {
      role,
      setRoleId,
      can: (permission?: Permission) =>
        !permission || role.permissions.includes(permission),
    };
  }, [roleId]);

  return (
    <AdminRoleContext.Provider value={value}>{children}</AdminRoleContext.Provider>
  );
}

export function useAdminRole() {
  return useContext(AdminRoleContext);
}
