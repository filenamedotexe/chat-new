export type UserRole = 'admin' | 'client' | 'team_member';

interface Permission {
  roles: readonly UserRole[];
}

type PermissionKey = 
  | 'viewAllOrganizations'
  | 'manageUsers'
  | 'viewSystemStats'
  | 'manageFeatureFlags'
  | 'viewAllProjects'
  | 'createProjects'
  | 'manageAllTasks'
  | 'viewAllMessages'
  | 'viewOwnOrganization'
  | 'viewOwnProjects'
  | 'viewOwnTasks'
  | 'sendMessages'
  | 'uploadFiles'
  | 'approveDeliverables'
  | 'requestChanges';

export const permissions: Record<PermissionKey, Permission> = {
  // Admin only
  viewAllOrganizations: { roles: ['admin'] },
  manageUsers: { roles: ['admin'] },
  viewSystemStats: { roles: ['admin'] },
  manageFeatureFlags: { roles: ['admin'] },
  
  // Admin and team members
  viewAllProjects: { roles: ['admin', 'team_member'] },
  createProjects: { roles: ['admin', 'team_member'] },
  manageAllTasks: { roles: ['admin', 'team_member'] },
  viewAllMessages: { roles: ['admin', 'team_member'] },
  
  // All authenticated users
  viewOwnOrganization: { roles: ['admin', 'client', 'team_member'] },
  viewOwnProjects: { roles: ['admin', 'client', 'team_member'] },
  viewOwnTasks: { roles: ['admin', 'client', 'team_member'] },
  sendMessages: { roles: ['admin', 'client', 'team_member'] },
  uploadFiles: { roles: ['admin', 'client', 'team_member'] },
  
  // Client specific
  approveDeliverables: { roles: ['client'] },
  requestChanges: { roles: ['client'] },
};

export function hasPermission(userRole: UserRole | undefined, permission: keyof typeof permissions): boolean {
  if (!userRole) return false;
  const allowedRoles = permissions[permission].roles as readonly UserRole[];
  return allowedRoles.includes(userRole);
}

export function hasAnyRole(userRole: UserRole | undefined, roles: UserRole[]): boolean {
  if (!userRole) return false;
  return roles.includes(userRole);
}

export function isAdmin(userRole: UserRole | undefined): boolean {
  return userRole === 'admin';
}

export function isClient(userRole: UserRole | undefined): boolean {
  return userRole === 'client';
}

export function isTeamMember(userRole: UserRole | undefined): boolean {
  return userRole === 'team_member';
}