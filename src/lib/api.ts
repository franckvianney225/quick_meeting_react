/**
 * Utility functions for API URL construction
 */

/**
 * Get the base API URL from environment variable
 * Throws an error if not set in production
 */
export const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is required in production');
    }
    // Fallback for development only
    return 'http://192.168.1.72:3001';
  }
  return apiUrl;
};

/**
 * Construct a full API endpoint URL
 * @param endpoint - The API endpoint path (e.g., '/auth/login')
 * @returns Full URL including the base API URL
 */
export const apiUrl = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  // Ensure endpoint starts with a slash and baseUrl doesn't end with one
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}${normalizedEndpoint}`;
};

/**
 * Get the full URL for user avatars
 * @param avatarPath - The avatar path from the API response
 * @returns Full avatar URL
 */
export const getAvatarUrl = (avatarPath: string | null | undefined): string => {
  if (!avatarPath || avatarPath.includes('http')) {
    return avatarPath || '/default-avatar.jpg';
  }
  return `${getApiUrl()}${avatarPath}`;
};