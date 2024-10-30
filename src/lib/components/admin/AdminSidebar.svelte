<script lang="ts">
  import { page } from '$app/stores';

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'Users', path: '/admin/users', icon: '👥' },
    { label: 'Transactions', path: '/admin/transactions', icon: '💰' },
    { label: 'Audit Log', path: '/admin/audit', icon: '📝' },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️' }
  ];
</script>

<aside class="w-64 bg-casino-darkBlue/95 min-h-screen border-r border-white/5 shadow-xl">
  <nav class="p-4">
    {#each menuItems as item}
      <a
        href={item.path}
        class="flex items-center space-x-3 p-3 rounded-lg mb-2
               {$page.url.pathname === item.path ? 
                 'bg-casino-burgundy/80 text-white' : 
                 'text-white/60 hover:bg-white/5 hover:text-white'}
               transition-all duration-200"
      >
        <span>{item.icon}</span>
        <span class="font-serif">{item.label}</span>
      </a>
    {/each}
  </nav>
</aside>