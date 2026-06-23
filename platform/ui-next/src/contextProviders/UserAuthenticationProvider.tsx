import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

/**
 * Parse JWT token to extract user roles
 */
function parseJwtRoles(token: string): string[] {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return [];

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    const realmRoles = payload.realm_access?.roles || [];
    const clientRoles: string[] = [];

    if (payload.resource_access) {
      Object.values(payload.resource_access).forEach((access: any) => {
        if (access.roles) {
          clientRoles.push(...access.roles);
        }
      });
    }

    // Combine all roles and remove duplicates, filter out default Keycloak roles
    const allRoles = [...new Set([...realmRoles, ...clientRoles])];
    return allRoles.filter(
      (role: string) => !['default-roles-pacs', 'offline_access', 'uma_authorization'].includes(role)
    );
  } catch (error) {
    console.warn('Failed to parse JWT token for roles:', error);
    return [];
  }
}

const DEFAULT_STATE = {
  user: null,
  enabled: false,
};

export const UserAuthenticationContext = createContext(DEFAULT_STATE);

export function UserAuthenticationProvider({ children, service }) {
  const userAuthenticationReducer = (state, action) => {
    switch (action.type) {
      case 'SET_USER': {
        return {
          ...state,
          ...{ user: action.payload.user },
        };
      }
      case 'RESET': {
        return {
          user: null,
        };
      }

      case 'SET': {
        return {
          ...state,
          ...action.payload,
        };
      }

      default:
        return action.payload;
    }
  };

  const [userAuthenticationState, dispatch] = useReducer(userAuthenticationReducer, DEFAULT_STATE);

  const getState = useCallback(() => userAuthenticationState, [userAuthenticationState]);

  const setUser = useCallback(
    user => {
      // Extract roles from JWT token if available
      const enhancedUser = user ? { ...user } : null;
      if (enhancedUser && enhancedUser.access_token) {
        const roles = parseJwtRoles(enhancedUser.access_token);
        if (roles.length > 0) {
          enhancedUser.roles = roles;
        }
      }

      dispatch({
        type: 'SET_USER',
        payload: {
          user: enhancedUser,
        },
      });
    },
    [dispatch]
  );

  const getUser = useCallback(() => userAuthenticationState.user, [userAuthenticationState]);

  const reset = useCallback(
    () =>
      dispatch({
        type: 'RESET',
        payload: {},
      }),
    [dispatch]
  );

  const set = useCallback(
    payload =>
      dispatch({
        type: 'SET',
        payload,
      }),
    [dispatch]
  );

  /**
   * Sets the implementation of the UserAuthenticationService that can be used by extensions.
   *
   * @returns void
   */
  // TODO: should this be a useEffect or not?
  useEffect(() => {
    if (service) {
      service.setServiceImplementation({
        getState,
        setUser,
        getUser,
        reset,
        set,
      });
    }
  }, [getState, service, setUser, getUser, reset, set]);

  // TODO: This may not be correct, but I think we need to set the implementation for the service
  // immediately when this runs, since otherwise the authentication redirects will fail.
  // (useEffect only runs after the child components - in this case, routing logic - has failed)
  if (service) {
    service.setServiceImplementation({
      getState,
      setUser,
      getUser,
      reset,
      set,
    });
  }

  const api = {
    getState,
    setUser,
    getUser,
    getAuthorizationHeader: service.getAuthorizationHeader,
    handleUnauthenticated: service.handleUnauthenticated,
    reset,
    set,
  };

  return (
    <UserAuthenticationContext.Provider value={[userAuthenticationState, api]}>
      {children}
    </UserAuthenticationContext.Provider>
  );
}

export default UserAuthenticationProvider;

const UserAuthenticationConsumer = UserAuthenticationContext.Consumer;
export { UserAuthenticationConsumer };

UserAuthenticationProvider.propTypes = {
  children: PropTypes.any,
  service: PropTypes.shape({
    setServiceImplementation: PropTypes.func,
  }).isRequired,
};

export const useUserAuthentication = () => useContext(UserAuthenticationContext);
