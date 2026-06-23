import { PubSubService } from '@ohif/core';
import {
  Role,
  Permission,
  hasPermission,
  getPermissionsForRoles,
  getHighestPriorityRole,
  extractUserFromToken,
  isTokenExpired,
  getAccessToken,
  type ParsedUser,
} from '../utils';

const EVENTS = {
  USER_PERMISSIONS_CHANGED: 'event::PermissionService:userPermissionsChanged',
  ROLES_CHANGED: 'event::PermissionService:rolesChanged',
};

/**
 * PermissionService manages role-based access control for the application.
 * It integrates with Keycloak to extract roles from JWT tokens and provides
 * methods to check permissions.
 */
export default class PermissionService extends PubSubService {
  public static readonly EVENTS = EVENTS;

  public static REGISTRATION = {
    name: 'permissionService',
    create: ({ configuration = {} }) => {
      return new PermissionService();
    },
  };

  private currentUser: ParsedUser | null = null;
  private roles: Role[] = [];

  constructor() {
    super(PermissionService.EVENTS);
  }

  /**
   * Initialize the service with user information from the authentication service
   * @param userAuthenticationService - The user authentication service
   */
  initialize(userAuthenticationService: any): void {
    // Try to get current user
    const user = userAuthenticationService.getUser();
    if (user) {
      this.handleUserChanged(user);
    }
  }

  /**
   * Handle user changed event
   * @param user - The user object from authentication service
   */
  private handleUserChanged(user: any): void {
    if (!user) {
      this.currentUser = null;
      this.roles = [];
      this._broadcastEvent(PermissionService.EVENTS.USER_PERMISSIONS_CHANGED, {
        user: null,
        roles: [],
        permissions: [],
      });
      return;
    }

    // Extract user information from JWT token
    const accessToken = user.access_token || getAccessToken();
    if (accessToken) {
      const parsedUser = extractUserFromToken(accessToken);
      if (parsedUser && !isTokenExpired(parsedUser.tokenExpiry)) {
        this.currentUser = parsedUser;
        this.roles = parsedUser.roles
          .map(r => r.toLowerCase() as Role)
          .filter(r => Object.values(Role).includes(r));
      }
    }

    // If we couldn't parse the token, try to get roles from the user object
    if (!this.currentUser && user.roles) {
      this.roles = user.roles
        .map((r: string) => r.toLowerCase() as Role)
        .filter((r: Role) => Object.values(Role).includes(r));
    }

    this._broadcastEvent(PermissionService.EVENTS.USER_PERMISSIONS_CHANGED, {
      user: this.currentUser,
      roles: this.roles,
      permissions: this.getPermissions(),
    });
  }

  /**
   * Get the current user
   * @returns The current parsed user or null
   */
  getCurrentUser(): ParsedUser | null {
    return this.currentUser;
  }

  /**
   * Get the current user's roles
   * @returns Array of roles
   */
  getRoles(): Role[] {
    return this.roles;
  }

  /**
   * Get the current user's highest priority role
   * @returns The highest priority role or null
   */
  getPrimaryRole(): Role | null {
    return getHighestPriorityRole(this.roles);
  }

  /**
   * Get all permissions for the current user
   * @returns Array of permissions
   */
  getPermissions(): Permission[] {
    return getPermissionsForRoles(this.roles);
  }

  /**
   * Check if the current user has a specific permission
   * @param permission - The permission to check
   * @returns True if the user has the permission
   */
  hasPermission(permission: Permission): boolean {
    return hasPermission(this.roles, permission);
  }

  /**
   * Check if the current user has any of the specified permissions
   * @param permissions - Array of permissions to check
   * @returns True if the user has any of the permissions
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if the current user has all of the specified permissions
   * @param permissions - Array of permissions to check
   * @Returns True if the user has all of the permissions
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Check if the current user has a specific role
   * @param role - The role to check
   * @returns True if the user has the role
   */
  hasRole(role: Role): boolean {
    return this.roles.includes(role);
  }

  /**
   * Check if the current user has any of the specified roles
   * @param roles - Array of roles to check
   * @returns True if the user has any of the roles
   */
  hasAnyRole(roles: Role[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Set the service implementation for backward compatibility
   * @param implementation - The service implementation
   */
  setServiceImplementation(implementation: any): void {
    // This is for backward compatibility with the existing UserAuthenticationService
  }
}

export { PermissionService };
