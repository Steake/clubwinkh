<script lang="ts">
  import { fade } from 'svelte/transition';
  import { authStore } from '$lib/stores/authStore';
  import { goto } from '$app/navigation';
  
  let isLogin = true;
  let email = '';
  let username = '';
  let password = '';
  let confirmPassword = '';
  let errorMessage = '';

  async function handleSubmit() {
    errorMessage = '';
    
    if (!isLogin && password !== confirmPassword) {
      errorMessage = 'Passwords do not match';
      return;
    }

    try {
      let success;
      
      if (isLogin) {
        success = await authStore.login(email, password);
      } else {
        success = await authStore.register(email, password, username);
      }

      if (success) {
        // Redirect to home page after successful authentication
        goto('/');
      } else if ($authStore.error) {
        errorMessage = $authStore.error;
      }
    } catch (error) {
      errorMessage = 'An unexpected error occurred. Please try again.';
    }
  }

  // Clear error message when switching between login/register
  function toggleAuthMode() {
    isLogin = !isLogin;
    errorMessage = '';
    authStore.clearError();
  }
</script>

<svelte:head>
  <title>{isLogin ? 'Login' : 'Sign Up'} - Club Win KH</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4">
  <div class="pattern-overlay"></div>
  
  <div class="w-full max-w-md" in:fade={{ duration: 200 }}>
    <div class="deco-panel">
      <div class="text-center mb-8">
        <h1 class="font-display text-4xl deco-text mb-2">
          {isLogin ? 'Welcome Back' : 'Join Club Win KH'}
        </h1>
        <p class="text-gold-muted">
          {isLogin ? 
            'Enter your credentials to continue' : 
            'Create your account to start playing'}
        </p>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        {#if !isLogin}
          <div>
            <label for="username" class="block text-gold-muted mb-2">Username</label>
            <input
              type="text"
              id="username"
              bind:value={username}
              required
              class="deco-input w-full"
              placeholder="Choose a username"
            />
          </div>
        {/if}

        <div>
          <label for="email" class="block text-gold-muted mb-2">Email</label>
          <input
            type="email"
            id="email"
            bind:value={email}
            required
            class="deco-input w-full"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label for="password" class="block text-gold-muted mb-2">Password</label>
          <input
            type="password"
            id="password"
            bind:value={password}
            required
            class="deco-input w-full"
            placeholder="Enter your password"
          />
        </div>

        {#if !isLogin}
          <div>
            <label for="confirmPassword" class="block text-gold-muted mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              bind:value={confirmPassword}
              required
              class="deco-input w-full"
              placeholder="Confirm your password"
            />
          </div>
        {/if}

        {#if errorMessage}
          <p class="text-red-400 text-sm">{errorMessage}</p>
        {/if}

        <button
          type="submit"
          class="w-full deco-button"
          disabled={$authStore.loading}
        >
          <span class="font-display text-lg">
            {#if $authStore.loading}
              Loading...
            {:else}
              {isLogin ? 'Login' : 'Sign Up'}
            {/if}
          </span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <button
          class="text-gold-muted hover:text-gold transition-colors duration-200"
          on:click={toggleAuthMode}
        >
          {isLogin ? 
            "Don't have an account? Sign up" : 
            'Already have an account? Login'}
        </button>
      </div>
    </div>
  </div>
</div>
