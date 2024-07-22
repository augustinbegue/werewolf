<script lang="ts">
	import cards from '$lib/cards.json';
</script>

<section class="container mx-auto flex flex-col justify-center p-4 gap-4">
	<h1 class="text-4xl text-gray-100 font-bold">Loup Garou</h1>
	<a class="btn btn-primary max-w-52" href="/new">Nouvelle Partie</a>
	<div class="formatted">
		<h2 class="">A Propos</h2>
		<p>Joue au jeu du Loup-Garou sans cartes!</p>
		<h2 class="text-2xl font-semibold mb-2 mt-4">Comment Jouer ?</h2>
		<p>
			Crée une partie avec le nombre de joueurs et les roles que tu veux, et demande a tes amis de
			rejoindre avec leur téléphone. Lorsque tout les joueurs ont rejoins, ils obtiendront tous leur
			rôle.
		</p>
		<h2 class="text-2xl font-semibold mb-2 mt-4">Liste des rôles du jeu</h2>
		<h3>Jeu de base</h3>
		{#each cards.filter((c) => c.category === 'base') as card}
			<div>
				<img src={card.image} alt="" />
				<div>
					<h4>{card.name}</h4>
					<p>{@html card.description}</p>
				</div>
			</div>
		{/each}
		<h3>Nouvelle Lune</h3>
		{#each cards.filter((c) => c.category === 'new-moon') as card}
			<div>
				<img src={card.image} alt="" />
				<div>
					<h4>{card.name}</h4>
					<p>{@html card.description}</p>
				</div>
			</div>
		{/each}
		<h3>Village</h3>
		{#each cards.filter((c) => c.category === 'village') as card}
			<div>
				<img src={card.image} alt="" />
				<div>
					<h4>{card.name}</h4>
					<p>{@html card.description}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

<style lang="postcss">
	.formatted {
		& img {
			@apply aspect-square grow-0 self-start;
		}
		& > div {
			@apply flex flex-col md:flex-row md:gap-4 mt-4;
		}
		& h2 {
			@apply text-2xl font-semibold mb-4 mt-8;
		}
		& h3 {
			@apply text-xl font-semibold mb-2 mt-4;
		}
		& h4 {
			@apply text-lg font-semibold mb-1;
		}
		& p {
			@apply text-base;
		}
		& ul {
			@apply list-disc pl-6;
		}
	}
</style>
