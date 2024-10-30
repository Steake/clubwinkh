<script lang="ts">
  import type { User } from '$lib/types/admin';
  import { createEventDispatcher } from 'svelte';

  export let user: User;
  
  const dispatch = createEventDispatcher();

  async function handleTokenAction(action: 'credit' | 'debit') {
    const amount = prompt(`Enter amount to ${action}:`);
    if (!amount) return;
    
    const reason = prompt('Enter reason for this action:');
    if (!reason) return;

    dispatch('tokenAction', {
      userId: user.id,
      action,
      amount: parseFloat(amount),
      reason
    });
  }

  async function handleStatusToggle() {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    const reason = prompt(`Enter reason to ${newStatus === 'disabled' ? 'disable' : 'enable'} account:`);
    if (!reason) return;

    dispatch('statusToggle', {
      userId: user.id,
      newStatus,
      reason
    });
  }
</script>

<div class="flex space-x-2">
  <button
    on:click={() => handleTokenAction('credit')}
    class="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg 
           hover:bg-emerald-500/20 transition-colors duration-200 text-sm font-medium"
  >
    Credit
  </button>
  
  <button
    on:click={() => handleTokenAction('debit')}
    class="px-4 py-1.5 bg-red-500/10 text-red-400 rounded-lg 
           hover:bg-red-500/20 transition-colors duration-200 text-sm font-medium"
  >
    Debit
  </button>
  
  <button
    on:click={handleStatusToggle}
    class="px-4 py-1.5 rounded-lg text-sm font-medium
           {user.status === 'active' ? 
             'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 
             'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}
           transition-colors duration-200"
  >
    {user.status === 'active' ? 'Disable' : 'Enable'}
  </button>
</div>