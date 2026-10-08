// Keeps the JWT in localStorage so a page refresh keeps the user logged in
const ACCESS_TOKEN_STORAGE_KEY = 'library.accessToken';
const ACCESS_TOKEN_EXPIRY_STORAGE_KEY = 'library.accessTokenExpiresAt';

export const accessTokenStorage = {
  save(accessToken: string, expiresAt: string): void {
    try {
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
      localStorage.setItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY, expiresAt);
    } catch {
      // Storage can be blocked (private mode) - the session then lasts until refresh
    }
  },

  // Returns the token only while it has not expired
  read(): string | null {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      const expiresAt = localStorage.getItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY);

      if (!accessToken || !expiresAt || new Date(expiresAt) <= new Date()) {
        return null;
      }

      return accessToken;
    } catch {
      return null;
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      localStorage.removeItem(ACCESS_TOKEN_EXPIRY_STORAGE_KEY);
    } catch {
      // Nothing to clear when storage is unavailable
    }
  },
};
