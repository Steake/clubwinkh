import { browser } from '$app/environment';
import { api } from '$lib/services/api';
import { authStore, type AuthState } from '$lib/stores/authStore';

export const ssr = false;

export async function load() {
    if (browser) {
        const token = localStorage.getItem('token');
        if (token) {
            // Set the token in the API client
            api.setToken(token);
            
            // Get the current user's profile
            const response = await api.getUser('me');
            if (!response.error && response.data) {
                // Update the auth store with the user data
                authStore.update((state: AuthState) => ({
                    ...state,
                    user: response.data,
                    isAuthenticated: true,
                    loading: false,
                    error: null
                }));
            } else {
                // If there was an error, clear the invalid token
                localStorage.removeItem('token');
                api.clearToken();
            }
        }
    }
    
    return {};
}
