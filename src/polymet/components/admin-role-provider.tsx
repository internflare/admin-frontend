import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ADMIN_ROLES,
  type AdminRoleDefinition,
  type AdminRoleId,
  type Permission,
} from "@/polymet/data/admin-roles";

interface AdminRoleContextValue {
  role: AdminRoleDefinition | null;
  setRoleId: (id: AdminRoleId | null) => void;
  setPermissions: (permissions: Permission[] | null) => void;
  can: (permission?: Permission) => boolean;
}

const AdminRoleContext = createContext<AdminRoleContextValue | undefined>(undefined);

/**
 * Supply frontend permission checks from the validated administrator session.
 * ReactNode children consume a nullable AdminRoleDefinition and a boolean can()
 * predicate. Initial or unknown roles have no access; role labels do not grant
 * baseline permissions. Only the server's Permission[] claims enable controls.
 * Changing role clears old claims, and setting null clears the signed-out role.
 * These UI decisions never replace backend authorization for mutations or reads.
 */
export function AdminRoleProvider({
  children,
  initialRole,
}: {
  children: ReactNode;
  initialRole?: AdminRoleId;
}) {
  const [roleId, setRoleIdState] = useState<AdminRoleId | null>(initialRole ?? null);
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([]);

  // Updates the role ID and resets custom permissions when the role changes.
  const setRoleId = useCallback((id: AdminRoleId | null) => {
    setRoleIdState(id);
    setCustomPermissions([]);
  }, []);

  const setPermissions = useCallback((perms: Permission[] | null) => {
    setCustomPermissions(perms ?? []);
  }, []);

  const value = useMemo(() => {
    const role = ADMIN_ROLES.find((r) => r.id === roleId) ?? null;
    return {
      role,
      setRoleId,
      setPermissions,
      can: (permission?: Permission) => {
        if (!role) return false;
        if (!permission) return true;
        return customPermissions.includes(permission);
      },
    };
  }, [roleId, customPermissions, setRoleId, setPermissions]);

  return (
    <AdminRoleContext.Provider value={value}>
      {children}
    </AdminRoleContext.Provider>
  );
}

export function useAdminRole() {
  const context = useContext(AdminRoleContext);
  if (!context) throw new Error("useAdminRole must be used within AdminRoleProvider");
  return context;
}
