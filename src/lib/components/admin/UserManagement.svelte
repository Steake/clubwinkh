<script lang="ts">
  import { adminState } from '$lib/stores/adminStore';
  import type { User } from '$lib/types/admin';
  import UserActions from './UserActions.svelte';

  export let users: User[] = [];
  
  let searchInput: string = '';
  let statusFilter: 'all' | 'active' | 'disabled' = 'all';

  $: filteredUsers = users
    .filter(user => 
      user.username.toLowerCase().includes(searchInput.toLowerCase()) ||
      user.email.toLowerCase().includes(searchInput.toLowerCase())
    )
    .filter(user => 
      statusFilter === 'all' ? true : user.status === statusFilter
    );

  function handleUserSelect(userId: string) {
    adminState.update(state => ({ ...state, selectedUser: userId }));
  }
</script>

<div class="glass-panel rounded-lg shadow-xl">
  <div class="p-6 border-b border-white/5">
    <div class="flex space-x-4">
      <input
        type="text"
        bind:value={searchInput}
        placeholder="Search users..."
        class="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2
               text-white placeholder-white/30 focus:border-casino-gold/50
               focus:outline-none transition-colors duration-200"
      />
      
      <select
        bind:value={statusFilter}
        class="bg-white/5 border border-white/10 rounded-lg px-4 py-2
               text-white focus:border-casino-gold/50 focus:outline-none
               transition-colors duration-200"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="disabled">Disabled</option>
      </select>
    </div>
  </div>

  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-white/5">
          <th class="text-left p-4 text-casino-gold font-serif">Username</th>
          <th class="text-left p-4 text-casino-gold font-serif">Email</th>
          <th class="text-left p-4 text-casino-gold font-serif">Balance</th>
          <th class="text-left p-4 text-casino-gold font-serif">Status</th>
          <th class="text-left p-4 text-casino-gold font-serif">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredUsers as user}
          <tr class="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
            <td class="p-4 text-white">{user.username}</td>
            <td class="p-4 text-white/70">{user.email}</td>
            <td class="p-4 text-white">{user.balance} tokens</td>
            <td class="p-4">
              <span class="px-3 py-1 rounded-full text-sm font-medium
                         {user.status === 'active' ? 
                           'bg-emerald-500/10 text-emerald-400' : 
                           'bg-red-500/10 text-red-400'}">
                {user.status}
              </span>
            </td>
            <td class="p-4">
              <UserActions {user} />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>