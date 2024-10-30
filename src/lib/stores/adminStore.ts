import { writable } from 'svelte/store';

export interface AdminState {
  selectedUser: string | null;
  filterStatus: 'all' | 'active' | 'disabled';
  searchQuery: string;
}

export const adminState = writable<AdminState>({
  selectedUser: null,
  filterStatus: 'all',
  searchQuery: ''
});