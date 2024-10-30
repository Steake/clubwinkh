<script lang="ts">
  import type { Transaction } from '$lib/types/admin';

  export let transaction: Transaction;
</script>

<tr class="border-b border-gold/10 hover:bg-gold/5 transition-colors duration-200">
  <td class="p-4 text-gold">{transaction.userId}</td>
  <td class="p-4">
    <span class="px-2 py-1 rounded-sm text-sm
                {transaction.type === 'credit' ? 
                  'bg-jade/10 text-jade' : 
                  'bg-red-500/10 text-red-400'}">
      {transaction.type}
    </span>
  </td>
  <td class="p-4 text-gold">{transaction.amount} tokens</td>
  <td class="p-4 text-gold-muted">{transaction.adminId}</td>
  <td class="p-4 text-gold-muted">{transaction.reason}</td>
  <td class="p-4 text-gold-muted">
    {new Date(transaction.timestamp).toLocaleString()}
  </td>
</tr>