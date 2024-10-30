<script lang="ts">
  import UserManagement from '$lib/components/admin/UserManagement.svelte';
  import type { User } from '$lib/types/admin';

  // Mock data - replace with actual API calls
  const users: User[] = [
    {
      id: '1',
      username: 'john_doe',
      email: 'john@example.com',
      status: 'active',
      balance: 1000,
      lastLogin: '2024-01-01T10:00:00Z',
      createdAt: '2023-12-01T00:00:00Z'
    },
    {
      id: '2',
      username: 'jane_smith',
      email: 'jane@example.com',
      status: 'disabled',
      balance: 500,
      lastLogin: '2024-01-02T15:30:00Z',
      createdAt: '2023-12-15T00:00:00Z'
    }
  ];
</script>

<svelte:head>
  <title>User Management - ImmerseVerse Admin</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-3xl font-serif text-casino-gold">User Management</h2>
  </div>

  <UserManagement {users} />
</div>