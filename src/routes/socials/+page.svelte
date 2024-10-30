<script lang="ts">
  import { fade } from 'svelte/transition';

  const telegramGroup = 'https://t.me/clubwinkh';
  const telegramApp = 'https://t.me/clubwinkh_bot';

  const socialLinks = [
    {
      title: 'Telegram Community',
      description: 'Join our vibrant Telegram community for updates, discussions, and exclusive content.',
      icon: '💬',
      url: telegramGroup,
      buttonText: 'Join Group'
    },
    {
      title: 'Telegram Mini App',
      description: 'Experience Club Win KH directly in Telegram with our mini app.',
      icon: '🎮',
      url: telegramApp,
      buttonText: 'Launch App'
    }
  ];
</script>

<svelte:head>
  <title>Social Community - Club Win KH</title>
  <meta name="description" content="Join the Club Win KH community on Telegram" />
</svelte:head>

<div class="relative min-h-[80vh] flex items-center">
  <div class="pattern-overlay"></div>
  
  <div class="max-w-7xl mx-auto px-6 py-24 w-full">
    <div class="text-center mb-16">
      <h1 class="font-display text-5xl deco-text mb-4">Join Our Community</h1>
      <p class="text-gold-muted text-lg">Connect with players and stay updated</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {#each socialLinks as link}
        <div 
          class="deco-panel group hover:shadow-glow transition-all duration-300"
          in:fade={{ duration: 200 }}
        >
          <div class="text-center p-8">
            <span class="text-4xl mb-6 block">{link.icon}</span>
            <h2 class="font-display text-2xl text-gold mb-4">{link.title}</h2>
            <p class="text-gold-muted mb-8">{link.description}</p>
            <a 
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              class="deco-button inline-block group-hover:border-gold/40 group-hover:shadow-glow"
            >
              <span class="font-display">{link.buttonText}</span>
            </a>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-16 text-center">
      <div class="deco-border inline-block px-8 py-4">
        <p class="text-gold-muted">
          Follow us on Telegram for exclusive updates and community events
        </p>
      </div>
    </div>
  </div>
</div>