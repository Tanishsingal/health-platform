// Healthcare Platform API Client
// This replaces the Supabase client with our custom implementation

import { apiClient } from './api/client';

export function createClient() {
  // Return our custom API client instead of Supabase
  return apiClient;
}

// For backward compatibility, export the API client directly
export { apiClient as client };
export default apiClient;
