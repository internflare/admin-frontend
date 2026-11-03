import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  ADMIN_ROLES,
  type AdminRoleDefinition,
  type AdminRoleId,
  type Permission,
} from "@/polymet/data/admin-roles";

interface AdminRoleContextValue {
  role: AdminRoleDefinition;
  setRoleId: (id: AdminRoleId) => void;
  setPermissions: (permissions: Permission[] | null) => void;
  can: (permission?: Permission) => boolean;
}

const defaultRole = ADMIN_ROLES[0];

const AdminRoleContext = createContext<AdminRoleContextValue>({
  role: defaultRole,
  setRoleId: () => undefined,
  setPermissions: () => undefined,
  can: (permission) => !permission,
});

/**
 * Dynamic RBAC Context (Phase 3).
 *
 * Synchronizes with the live authenticated admin's permissions returned by the backend.
 * Supports:
 * 1. Authoritative permissions evaluated against server claims (custom or role-derived).
 */
export function AdminRoleProvider({
  children,
  initialRole = "super_admin",
}: {
  children: ReactNode;
  initialRole?: AdminRoleId;
}) {
  const [roleId, setRoleIdState] = useState<AdminRoleId>(initialRole);
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([]);

  const setRoleId = useCallback((id: AdminRoleId) => {
    setRoleIdState(id);
    setCustomPermissions([]);
  }, []);

  const setPermissions = useCallback((perms: Permission[] | null) => {
    setCustomPermissions(perms ?? []);
  }, []);

  const value = useMemo(() => {
    const role = ADMIN_ROLES.find((r) => r.id === roleId) ?? defaultRole;
    return {
      role,
      setRoleId,
      setPermissions,
      can: (permission?: Permission) => {
        if (!permission) return true;
        return customPermissions.includes(permission);
      },
    };
  }, [roleId, customPermissions, setRoleId, setPermissions]);

  return <AdminRoleContext.Provider value={value}>{children}</AdminRoleContext.Provider>;
}

export function useAdminRole() {
  return useContext(AdminRoleContext);
}
