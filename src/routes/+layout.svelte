<script>
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';
</script>

<div class="min-h-screen bg-mono-900 text-gold font-sans">
	<Navigation />
	<main class="relative">
		<slot />
	</main>
	<footer class="bg-mono-800 py-8 mt-auto border-t border-gold/5 shadow-inner-top">
		<div class="max-w-7xl mx-auto px-6 text-center">
			<div class="deco-border inline-block px-8 py-3">
				<p class="font-display text-gold-muted">© 2024 Club Win KH - High rollers roll better</p>
			</div>
		</div>
	</footer>
</div>