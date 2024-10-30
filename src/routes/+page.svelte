<script>
	import { onMount } from 'svelte';

	let featuredGames = [
		{
			title: 'Angkor Quest',
			image: '/images/games/angkor-quest.jpg',
			description: 'Explore the ancient temples of Angkor in this adventure game'
		},
		{
			title: 'Phnom Penh Racing',
			image: '/images/games/racing.jpg',
			description: 'Race through the streets of Cambodia\'s capital'
		},
		{
			title: 'Khmer Legends',
			image: '/images/games/legends.jpg',
			description: 'Experience traditional Cambodian stories in this RPG'
		}
	];
</script>

<svelte:head>
	<title>Club Win KH - High rollers roll better</title>
	<meta name="description" content="The Ultimate Interactive Entertainment Hub in Cambodia" />
</svelte:head>

<div class="relative">
	<div class="pattern-overlay"></div>
	
	<section class="text-center py-24 relative">
		<h1 class="font-display text-7xl mb-4 deco-text tracking-wider">
			Club Win KH
		</h1>
		<div class="inline-block relative mb-12">
			<div class="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent"></div>
			<p class="font-display text-2xl text-gold-muted tracking-[0.2em] uppercase py-2 px-12">
				High rollers roll better
			</p>
		</div>
		<div class="flex justify-center space-x-8">
			<a href="/games" class="deco-button">
				<span class="font-display text-lg">Explore Games</span>
			</a>
			<a href="/leaderboard" class="success-button">
				<span class="font-display text-lg">View Leaderboard</span>
			</a>
		</div>
	</section>

	<section class="py-24">
		<h2 class="font-display text-4xl text-center mb-16 deco-text">Featured Experiences</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto px-6">
			{#each featuredGames as game}
				<div class="deco-panel group">
					<div class="h-48 bg-mono-900 mb-6 overflow-hidden">
						<div class="h-full w-full bg-gradient-to-br from-gold/5 to-transparent 
								  group-hover:scale-110 transition-transform duration-500"></div>
					</div>
					<h3 class="font-display text-2xl mb-4 text-gold">{game.title}</h3>
					<p class="text-gold-muted mb-6 font-light leading-relaxed">{game.description}</p>
					<button class="w-full deco-button">
						<span class="font-display">Play Now</span>
					</button>
				</div>
			{/each}
		</div>
	</section>
</div>