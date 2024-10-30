import { writable } from 'svelte/store';

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
}

export const authStore = writable<AuthState>({
  user: null,
  isAuthenticated: false,
  loading: false
});