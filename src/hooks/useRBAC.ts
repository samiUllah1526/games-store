// React hook for RBAC
import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { hasRole, hasPermission, getUserRoles, isAdmin } from '../lib/rbac';

export function useRBAC() {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    async function loadRoles() {
      if (!user) {
        setRoles([]);
        setIsUserAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const userRoles = await getUserRoles();
        const admin = await isAdmin();
        
        setRoles(userRoles);
        setIsUserAdmin(admin);
      } catch (error) {
        console.error('Error loading roles:', error);
        setRoles([]);
        setIsUserAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    loadRoles();
  }, [user, authLoading]);

  const checkRole = async (roleName: string) => {
    if (!user) return false;
    return hasRole(roleName);
  };

  const checkPermission = async (permissionName: string) => {
    if (!user) return false;
    return hasPermission(permissionName);
  };

  return {
    roles,
    isAdmin: isUserAdmin,
    loading: loading || authLoading,
    checkRole,
    checkPermission,
  };
}

