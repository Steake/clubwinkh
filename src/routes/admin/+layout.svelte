<script lang="ts">
  import { page } from '$app/stores';
  import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';
  import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
</script>

<div class="min-h-screen bg-casino-smoke">
  <AdminHeader />
  <div class="flex">
    <AdminSidebar />
    <main class="flex-1 p-8">
      <slot />
    </main>
  </div>
</div>