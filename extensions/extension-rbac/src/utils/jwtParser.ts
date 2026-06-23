/**
 * JWT Token Parser for Keycloak
 *
 * Parses JWT tokens from Keycloak to extract user information and roles.
 */

export interface KeycloakTokenPayload {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  acr: string;
  'allowed-origins': string[];
  realm_access: {
    roles: string[];
  };
  resource_access: {
    [clientId: string]: {
      roles: string[];
    };
  };
  scope: string;
  sid: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}

export interface ParsedUser {
  id: string;
  username: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  roles: string[];
  realmRoles: string[];
  clientRoles: string[];
  tokenExpiry: number;
}

/**
 * Parse a JWT token without verification (verification should be done by the backend)
 * @param token - The JWT token string
 * @returns The parsed token payload
 */
export function parseJwtToken(token: string): KeycloakTokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
    return null;
  }
}

/**
 * Extract user information from a Keycloak JWT token
 * @param token - The JWT token string
 * @returns Parsed user information with roles
 */
export function extractUserFromToken(token: string): ParsedUser | null {
  const payload = parseJwtToken(token);
  if (!payload) {
    return null;
  }

  const realmRoles = payload.realm_access?.roles || [];
  const clientRoles: string[] = [];

  // Extract client roles from resource_access
  if (payload.resource_access) {
    Object.values(payload.resource_access).forEach(access => {
      if (access.roles) {
        clientRoles.push(...access.roles);
      }
    });
  }

  // Combine all roles and remove duplicates
  const allRoles = [...new Set([...realmRoles, ...clientRoles])];

  // Filter out default Keycloak roles
  const filteredRoles = allRoles.filter(
    role => !['default-roles-pacs', 'offline_access', 'uma_authorization'].includes(role)
  );

  return {
    id: payload.sub,
    username: payload.preferred_username,
    email: payload.email,
    name: payload.name || `${payload.given_name} ${payload.family_name}`,
    firstName: payload.given_name,
    lastName: payload.family_name,
    roles: filteredRoles,
    realmRoles,
    clientRoles,
    tokenExpiry: payload.exp,
  };
}

/**
 * Check if a token is expired
 * @param tokenExpiry - The token expiry timestamp (in seconds)
 * @returns True if the token is expired
 */
export function isTokenExpired(tokenExpiry: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now >= tokenExpiry;
}

/**
 * Get the access token from the OIDC storage or user object
 * @returns The access token string or null
 */
export function getAccessToken(): string | null {
  try {
    // Try to get from OIDC user manager
    const oidcStorage = sessionStorage.getItem(
      `oidc.user:${window.config?.oidc?.[0]?.authority}:${window.config?.oidc?.[0]?.client_id}`
    );

    if (oidcStorage) {
      const user = JSON.parse(oidcStorage);
      return user?.access_token || null;
    }

    return null;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}
