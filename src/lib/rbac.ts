// Role-Based Access Control utilities
import { supabase } from './supabase';

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(roleName: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('user_has_role', {
      user_uuid: user.id,
      role_name: roleName,
    });

    if (error) {
      console.error('Error checking role:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in hasRole:', error);
    return false;
  }
}

/**
 * Check if current user has a specific permission
 */
export async function hasPermission(permissionName: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('user_has_permission', {
      user_uuid: user.id,
      permission_name: permissionName,
    });

    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in hasPermission:', error);
    return false;
  }
}

/**
 * Get all roles for current user
 */
export async function getUserRoles(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase.rpc('get_user_roles', {
      user_uuid: user.id,
    });

    if (error) {
      console.error('Error getting user roles:', error);
      return [];
    }

    return (data || []).map((row: { role_name: string }) => row.role_name);
  } catch (error) {
    console.error('Error in getUserRoles:', error);
    return [];
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}

/**
 * Check if user is moderator
 */
export async function isModerator(): Promise<boolean> {
  return hasRole('moderator');
}

/**
 * Check if user can approve games
 */
export async function canApproveGames(): Promise<boolean> {
  return hasPermission('games.approve');
}

/**
 * Check if user can reject games
 */
export async function canRejectGames(): Promise<boolean> {
  return hasPermission('games.reject');
}

