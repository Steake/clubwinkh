import { writable } from 'svelte/store';
import { api } from '../services/api';

export interface User {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

function createAuthStore() {
    const { subscribe, set, update } = writable<AuthState>({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
    });

    return {
        subscribe,
        update: (updater: (state: AuthState) => AuthState) => update(updater),
        login: async (email: string, password: string) => {
            update(state => ({ ...state, loading: true, error: null }));
            
            const response = await api.login(email, password);
            
            if (response.error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: response.error || 'An error occurred during login'
                }));
                return false;
            }

            const { token, user } = response.data!;
            api.setToken(token);
            
            set({
                user,
                isAuthenticated: true,
                loading: false,
                error: null
            });
            
            return true;
        },

        register: async (email: string, password: string, username: string) => {
            update(state => ({ ...state, loading: true, error: null }));
            
            const response = await api.register(email, password, username);
            
            if (response.error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: response.error || 'An error occurred during registration'
                }));
                return false;
            }

            const { token, user } = response.data!;
            api.setToken(token);
            
            set({
                user,
                isAuthenticated: true,
                loading: false,
                error: null
            });
            
            return true;
        },

        logout: () => {
            api.clearToken();
            set({
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null
            });
        },

        clearError: () => {
            update(state => ({ ...state, error: null }));
        }
    };
}

export const authStore = createAuthStore();
