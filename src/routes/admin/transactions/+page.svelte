<script lang="ts">
  import type { PageData } from './$types';
  import TransactionList from '$lib/components/admin/TransactionList.svelte';

  /** @type {import('./$types').PageData} */
  export let data: PageData;
</script>

<svelte:head>
  <title>Transaction History - Club Win KH Admin</title>
</svelte:head>

<div class="space-y-6">
  <h2 class="font-display text-3xl deco-text">Transaction History</h2>
  <TransactionList transactions={data.transactions} />
</div>