<script lang="ts">
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/authStore';

  function handleLogout() {
    authStore.set({
      user: null,
      isAuthenticated: false,
      loading: false
    });
  }
</script>

<nav class="bg-mono-800/95 border-b border-gold/5 backdrop-blur-md shadow-inner-top">
  <div class="max-w-7xl mx-auto px-6">
    <div class="flex justify-between items-center h-20">
      <div class="flex items-center">
        <a href="/" class="font-display text-3xl deco-text tracking-wider">Club Win KH</a>
      </div>
      
      <div class="hidden md:flex space-x-12">
        <a 
          href="/"
          class="text-gold-muted hover:text-gold transition-colors duration-300 
                 {$page.url.pathname === '/' ? 'text-gold' : ''}"
        >
          <span class="font-display tracking-wide">Home</span>
        </a>
        <a 
          href="/games"
          class="text-gold-muted hover:text-gold transition-colors duration-300 
                 {$page.url.pathname === '/games' ? 'text-gold' : ''}"
        >
          <span class="font-display tracking-wide">Games</span>
        </a>
        <a 
          href="/leaderboard"
          class="text-gold-muted hover:text-gold transition-colors duration-300 
                 {$page.url.pathname === '/leaderboard' ? 'text-gold' : ''}"
        >
          <span class="font-display tracking-wide">Leaderboard</span>
        </a>
        <a 
          href="/socials"
          class="text-gold-muted hover:text-gold transition-colors duration-300 
                 {$page.url.pathname === '/socials' ? 'text-gold' : ''}"
        >
          <span class="font-display tracking-wide">Community</span>
        </a>
      </div>

      <div class="flex items-center space-x-6">
        {#if $authStore.isAuthenticated}
          <span class="text-gold-muted">
            Welcome, {$authStore.user?.username}
          </span>
          {#if $authStore.user?.role === 'admin'}
            <a 
              href="/admin"
              class="text-jade hover:text-jade-light transition-colors duration-300"
            >
              <span class="font-display tracking-wide">Admin Panel</span>
            </a>
          {/if}
          <button 
            on:click={handleLogout}
            class="deco-button"
          >
            <span class="font-display tracking-wide">Logout</span>
          </button>
        {:else}
          <a 
            href="/auth"
            class="success-button"
          >
            <span class="font-display tracking-wide">Login</span>
          </a>
        {/if}
      </div>
    </div>
  </div>
</nav>