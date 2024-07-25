<script lang="ts">
	import type { ActionData } from './$types';
	import { onMount } from 'svelte';
	import cards from '$lib/cards.json';

	const roles = cards.map((c) => ({ ...c, count: 0 }));

	let nbPlayers = 6;
	$: total = roles.reduce((acc, role) => acc + role.count, 0);

	export let form: ActionData;

	onMount(() => {
		if (form) {
			window.location.href = `/game/${form.id}`;
		}
	});
</script>

{#if !form}
	<div class="container mx-auto p-4 flex flex-col gap-4">
		<h1 class="text-4xl text-gray-100 font-bold">Loup Garou</h1>

		<h2 class="text-2xl font-semibold">Nouvelle Partie</h2>

		<form action="/new" method="POST" class="flex flex-col gap-4 items-start">
			<!-- Nombre de joueurs -->
			<div class="form-control">
				<label for="nbPlayers" class="label">
					<span class="label-text">Nombre de joueurs:</span>
				</label>
				<input
					class="input input-bordered"
					type="number"
					id="nbPlayers"
					name="nbPlayers"
					min="6"
					max="18"
					required
					bind:value={nbPlayers}
				/>
			</div>

			<div class="form-control">
				<label for="player1" class="label">
					<span class="label-text">Nom du Meneur de Jeu:</span>
				</label>
				<input
					class="input input-bordered"
					type="text"
					id="player1"
					name="player1"
					min="6"
					max="18"
					required
				/>
			</div>

			<span>
				<h3 class="text-xl font-semibold">Roles</h3>
				<p class="text-md">
					Entrer le nombre de joueurs pouvant avoir chaque role. Pour désactiver un role, laissez à
					0.
				</p>
			</span>

			<div
				class="grid grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2"
			>
				{#each roles as role}
					<div
						class="border input-bordered rounded-xl w-max tooltip tooltip-primary tooltip-top"
						data-tip={role.description.replace(/<[^>]*>?/gm, '')}
					>
						<img src={role.image} class="rounded-xl" alt={role.name} />
						<label for={role.name} class="input flex items-center gap-2 w-full rounded-xl">
							{role.name}:
							<input
								type="number"
								class=""
								id={role.name}
								name={role.name}
								min="0"
								max={nbPlayers}
								bind:value={role.count}
							/>
						</label>
					</div>
				{/each}
			</div>

			{#if total === nbPlayers}
				<button type="submit" class="btn btn-success">Créer la partie</button>
			{:else}
				<label>
					<span class="label-text text-error">
						Le nombre de joueurs et le nombre de joueurs pouvant avoir chaque rôles ne correspondent
						pas.
					</span>
				</label>
				<button type="submit" disabled class="btn btn-success">Créer la partie</button>
			{/if}
		</form>
	</div>
{:else}
	<div class="container mx-auto flex items-center justify-center p-4">
		<p>Création de la partie...</p>
	</div>
{/if}
