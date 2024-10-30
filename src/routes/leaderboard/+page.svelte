<script lang="ts">
  import type { LeaderboardEntry, LeaderboardPeriod } from '$lib/types/leaderboard';
  import { fade } from 'svelte/transition';

  // Mock data - replace with API calls
  const periods: LeaderboardPeriod[] = [
    { id: 'daily', label: 'Daily', startDate: '2024-01-10', endDate: '2024-01-10' },
    { id: 'weekly', label: 'Weekly', startDate: '2024-01-07', endDate: '2024-01-13' },
    { id: 'monthly', label: 'Monthly', startDate: '2024-01-01', endDate: '2024-01-31' }
  ];

  const leaderboardData: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: '1',
      username: 'CambodianGamer',
      score: 15000,
      badges: ['🏆', '⭐'],
      lastActive: '2024-01-10T15:30:00Z'
    },
    {
      rank: 2,
      userId: '2',
      username: 'PhnomPenhPro',
      score: 12500,
      badges: ['🎮'],
      lastActive: '2024-01-10T14:45:00Z'
    },
    {
      rank: 3,
      userId: '3',
      username: 'AngkorPlayer',
      score: 10000,
      badges: ['🎲'],
      lastActive: '2024-01-10T16:00:00Z'
    }
  ];

  let selectedPeriod = periods[0];
</script>

<svelte:head>
  <title>Leaderboard - Club Win KH</title>
  <meta name="description" content="Top players at Club Win KH" />
</svelte:head>

<div class="relative">
  <div class="pattern-overlay"></div>
  
  <div class="max-w-7xl mx-auto px-6 py-12">
    <div class="text-center mb-12">
      <h1 class="font-display text-5xl deco-text mb-4">Leaderboard</h1>
      <p class="text-gold-muted text-lg">Compete with the best players in Cambodia</p>
    </div>

    <div class="deco-panel mb-8">
      <div class="flex justify-center space-x-4 p-4 border-b border-gold/10">
        {#each periods as period}
          <button
            class="px-6 py-2 rounded-sm font-display
                   {selectedPeriod.id === period.id ? 
                     'bg-gold/10 text-gold' : 
                     'text-gold-muted hover:text-gold hover:bg-gold/5'}
                   transition-all duration-200"
            on:click={() => selectedPeriod = period}
          >
            {period.label}
          </button>
        {/each}
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gold/10">
              <th class="text-left p-6 text-gold font-display">Rank</th>
              <th class="text-left p-6 text-gold font-display">Player</th>
              <th class="text-left p-6 text-gold font-display">Score</th>
              <th class="text-left p-6 text-gold font-display">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {#each leaderboardData as entry}
              <tr 
                class="border-b border-gold/5 hover:bg-gold/5 transition-colors duration-200"
                in:fade={{ duration: 200 }}
              >
                <td class="p-6">
                  <span class="font-display text-2xl
                             {entry.rank === 1 ? 'text-gold' : 
                              entry.rank === 2 ? 'text-gold-muted' : 
                              entry.rank === 3 ? 'text-[#CD7F32]' : 'text-gold-muted'}">
                    #{entry.rank}
                  </span>
                </td>
                <td class="p-6">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <span class="text-lg">{entry.username[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p class="font-display text-gold">{entry.username}</p>
                      <div class="flex space-x-1 mt-1">
                        {#each entry.badges as badge}
                          <span>{badge}</span>
                        {/each}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="p-6">
                  <span class="font-display text-xl text-gold">{entry.score.toLocaleString()}</span>
                </td>
                <td class="p-6 text-gold-muted">
                  {new Date(entry.lastActive).toLocaleString()}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>