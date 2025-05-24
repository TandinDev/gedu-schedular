import { createContext } from 'react';

/**
 * Authentication Context
 * Provides user authentication state and methods throughout the app
 * 
 * @property {Object|null} user - The current user object or null if not authenticated
 * @property {boolean} loading - Whether authentication state is being loaded
 * @property {string} error - Any authentication error message
 * @property {Function} signIn - Sign in with email and password
 * @property {Function} signOut - Sign out the current user
 */
export const AuthContext = createContext({
  user: null,
  loading: true,
  error: "",
  signIn: async () => {},
  signOut: async () => {}
}); 