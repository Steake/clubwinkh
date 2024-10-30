<script lang="ts">
  import type { Transaction } from '$lib/types/admin';
  import TransactionRow from './TransactionRow.svelte';

  export let transactions: Transaction[];
</script>

<div class="deco-panel">
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-gold/20">
          <th class="text-left p-4 text-gold font-display">User ID</th>
          <th class="text-left p-4 text-gold font-display">Type</th>
          <th class="text-left p-4 text-gold font-display">Amount</th>
          <th class="text-left p-4 text-gold font-display">Admin</th>
          <th class="text-left p-4 text-gold font-display">Reason</th>
          <th class="text-left p-4 text-gold font-display">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {#each transactions as transaction}
          <TransactionRow {transaction} />
        {/each}
      </tbody>
    </table>
  </div>
</div>