<script lang="ts">
	import type { ActionData } from './$types';
	import { onMount, SvelteComponent } from 'svelte';
	import cards from '$lib/cards.json';

	let roles = cards.map((c) => ({ ...c, count: 0 }));

	let nbPlayers = 8;
	$: total = roles.reduce((acc, role) => acc + role.count, 0);

	export let form: ActionData;

	function incrementRole(roleName: string) {
		const role = roles.find((r) => r.name === roleName)!;
		if (role) {
			role.count = role.count + 1;
		}
		roles = [...roles];
		return role;
	}

	function decrementRole(roleName: string) {
		const role = roles.find((r) => r.name === roleName)!;
		if (role) {
			role.count = role.count > 0 ? role.count - 1 : 0;
		}
		roles = [...roles];
		return role;
	}

	onMount(() => {
		if (form) {
			window.location.href = `/game/${form.id}`;
		}
	});
</script>

{#if !form}
	<div class="container mx-auto p-4 flex flex-col gap-4 max-w-screen-md">
		<h1 class="text-4xl text-gray-100 font-bold font-display">Loup Garou</h1>

		<h2 class="text-2xl font-semibold font-display">Nouvelle Partie</h2>

		<div class="form-control">
			<label for="player1" class="label">
				<span class="label-text font-body">Nom du Meneur de Jeu:</span>
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

		<form action="/new" method="POST" class="flex flex-col gap-4 items-start">
			<!-- Nombre de joueurs -->
			<div class="form-control">
				<label for="nbPlayers" class="label">
					<span class="label-text font-body">Nombre de joueurs: {nbPlayers}</span>
				</label>
			</div>
			<input
				type="range"
				id="nbPlayers"
				name="nbPlayers"
				min="6"
				max="24"
				class="range range-primary"
				bind:value={nbPlayers}
			/>

			<span>
				<h3 class="text-xl font-semibold font-display">Roles de Base</h3>
			</span>

			<div class="flex flex-row justify-center items-center gap-2 w-full">
				{#each roles.filter((r) => r.name === 'Simple villageois' || r.name === 'Loup-Garou') as role}
					<div class="tooltip" data-tip={role.name}>
						<div class="w-32">
							<img src={role.image} class="rounded-xl" alt={role.name} />
							<div class="flex flex-row justify-center items-center gap-4 mt-2">
								<button
									class="btn btn-sm btn-primary w-8 h-8"
									on:click={(e) => {
										e.preventDefault();
										role = decrementRole(role.name);
									}}
									disabled={role.count === 0}
								>
									-
								</button>
								<span class="text-xl">{role.count}</span>
								<button
									class="btn btn-sm btn-primary w-8 h-8"
									on:click={(e) => {
										e.preventDefault();
										role = incrementRole(role.name);
									}}
								>
									+
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<span>
				<h3 class="text-xl font-semibold font-display">Roles Spéciaux</h3>
			</span>

			<div class="flex flex-row flex-wrap gap-2 justify-center">
				{#each roles.filter((r) => r.name !== 'Simple villageois' && r.name !== 'Loup-Garou') as role}
					<div class="tooltip" data-tip={role.name}>
						<button
							class="w-32"
							on:click={(e) => {
								e.preventDefault();
								if (role.count === 0) {
									role.count = 1;
								} else {
									role.count = 0;
								}
							}}
						>
							<img
								src={role.image}
								class="rounded-sm"
								alt={role.name}
								class:grayscale={role.count === 0}
							/>
							<div class="flex flex-row justify-center items-center gap-4 mt-2"></div>
						</button>
					</div>
				{/each}
			</div>

			{#if total === nbPlayers}
				<button type="submit" class="btn btn-success">Créer la partie</button>
			{:else}
				<label class="label" for="submit">
					<span class="label-text text-error">
						Le nombre de joueurs et le nombre de joueurs pouvant avoir chaque rôles ne correspondent
						pas. ({total} / {nbPlayers})
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
