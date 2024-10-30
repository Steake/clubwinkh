<script lang="ts">
  import { page } from '$app/stores';
  
  const adminName = "Admin"; // This should come from your auth store
</script>

<header class="bg-casino-darkBlue/95 border-b border-white/5 py-4 px-6 shadow-xl">
  <div class="flex justify-between items-center">
    <div class="flex items-center space-x-4">
      <h1 class="font-serif text-2xl text-casino-gold">Admin Panel</h1>
      <span class="text-white/20">|</span>
      <span class="text-white/60">{$page.url.pathname.split('/').pop()}</span>
    </div>
    
    <div class="flex items-center space-x-6">
      <span class="text-white/60">{adminName}</span>
      <button class="text-white/60 hover:text-casino-gold transition-colors duration-300">
        <span class="font-serif">Logout</span>
      </button>
    </div>
  </div>
</header>