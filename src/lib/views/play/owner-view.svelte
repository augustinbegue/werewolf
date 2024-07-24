<script lang="ts">
	import type { Player } from '@prisma/client';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from '../../../routes/game/[id]/play/$types';
	import { Howl, Howler } from 'howler';

	import cards from '$lib/cards.json';
	import phases from '$lib/phases.json';
	import { selectRandomElement } from '$lib/utils';
	import { onMount } from 'svelte';

	export let data: PageData;

	let showRole = false;

	let swapModal: HTMLDialogElement;
	let swapOriginPlayer: Player;
	let swapDestinationPlayerId: String;

	async function swapRoles() {
		const res = await fetch(`/api/game/${data.id}/swap`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				originPlayerId: swapOriginPlayer.id,
				destinationPlayerId: swapDestinationPlayerId
			})
		});

		if (res.ok) {
			const originRoleId = swapOriginPlayer.roleId;
			const destinationRoleId = data.players.find((p) => p.id === swapDestinationPlayerId)?.roleId;

			data.players = data.players.map((p) => {
				p.dead = false;
				if (p.id === swapOriginPlayer.id) {
					p.roleId = destinationRoleId as string;
				} else if (p.id === swapDestinationPlayerId) {
					p.roleId = originRoleId;
				}
				return p;
			});
		}

		swapModal.close();
	}

	async function restartGame() {
		if (confirm('Es-tu sûr de vouloir relancer la partie ?\nLes roles seront redistribués.')) {
			const res = await fetch(`/api/game/${data.id}/restart`, {
				method: 'POST'
			});

			if (res.ok) {
				await invalidateAll();
			}

			alert('La partie a été relancée.');
		}
	}

	let gamePhases: any[];
	let phaseIndex = 0;
	let nightIndex = 0;
	$: phase = gamePhases ? gamePhases[phaseIndex] : 0;
	let phasesMusic: any[];

	function getPhasesArray() {
		let tmp = [...phases];

		for (let i = 0; i < data.roles.length; i++) {
			const role = data.roles[i];
			if (role.maxCount === 0) continue;

			const card = cards.find((c) => c.name === role.name);

			if (isNaN(card?.metadata.order ?? NaN)) continue;

			const abilities = card?.metadata.abilities ?? [];

			for (let j = 0; j < abilities.length; j++) {
				const ability = abilities[j];

				if (ability.trigger === 'night') {
					if (ability.usage === 0) {
						tmp.push(card);
						break;
					} else if (ability.used < ability.usage) {
						console.log(`${role.name} - ${ability.name}`);

						tmp.push(card);
						break;
					}
				} else if (ability.trigger === 'everyOtherNight' && nightIndex % 2 === 1) {
					if (ability.usage === 0) {
						tmp.push(card);
						break;
					} else if (ability.used < ability.usage) {
						tmp.push(card);
						break;
					}
				} else if (ability.trigger === 'firstNightOnly' && nightIndex === 0) {
					if (ability.usage === 0) {
						tmp.push(card);
						break;
					} else if (ability.used < ability.usage) {
						tmp.push(card);
						break;
					}
				}
			}
		}

		tmp = tmp.sort((a, b) => (a.metadata.order ?? 0) - (b.metadata.order ?? 0));

		return tmp;
	}

	function nextPhase() {
		phaseIndex = phaseIndex + 1;

		console.log(phaseIndex, gamePhases.length);

		if (phaseIndex >= gamePhases.length) {
			phaseIndex = 0;
			nightIndex = nightIndex + 1;
			gamePhases = getPhasesArray();
			phasesMusic = gamePhases.map((p) => {
				return p.music;
			});
		}

		if (currentMusic) {
			currentMusic.fade(1, 0, 1000);
			let m = currentMusic;
			m.once('fade', () => {
				m.stop();
			});

			currentMusic = new Howl({
				src: selectRandomElement(phasesMusic[phaseIndex]),
				volume: 1,
				loop: true,
				html5: true
			});
			currentMusic?.play();
		}
	}

	let currentMusic: Howl | undefined;
	function toggleMusic() {
		if (currentMusic) {
			currentMusic.stop();
			currentMusic.unload();
			currentMusic = undefined;
		} else {
			currentMusic = new Howl({
				src: selectRandomElement(phasesMusic[phaseIndex])!,
				volume: 1,
				loop: true,
				html5: true
			});
			currentMusic!.play();
		}
	}

	onMount(() => {
		gamePhases = getPhasesArray();
		phasesMusic = gamePhases.map((p) => {
			return p.music;
		});
	});
</script>

{#if !showRole}
	<p class="text-xl">Roles</p>
{/if}
<div class="flex flex-col justify-center items-center">
	{#each data.players.filter((p) => !p.owner) as player}
		<div
			class:hidden={player.hidden}
			class:opacity-50={player.dead}
			class:md:text-6xl={showRole}
			class:text-4xl={showRole}
		>
			<button
				class="font-bold"
				on:click={() => {
					console.log(data.players);

					if (!showRole) {
						data.players = data.players.map((p) => {
							p.hidden = true;
							return p;
						});
						player.hidden = false;
						showRole = true;
					} else {
						data.players = data.players.map((p) => {
							p.hidden = false;
							return p;
						});
						showRole = false;
					}
				}}
			>
				{player.name}
			</button>
			- {data.roles.find((r) => r.id === player.roleId)?.name}
			{#if !showRole}
				{#if player.dead}
					-
					<button
						class="text-red-500 cursor-pointer"
						on:click={async () => {
							await fetch(`/api/game/${data.id}/player/${player.id}`, {
								method: 'PATCH',
								body: JSON.stringify({
									dead: false
								})
							});
							invalidateAll();
						}}
					>
						Mort
					</button>
				{:else}
					- <button
						class="text-green-500 cursor-pointer"
						on:click={async () => {
							await fetch(`/api/game/${data.id}/player/${player.id}`, {
								method: 'PATCH',
								body: JSON.stringify({
									dead: true
								})
							});
							invalidateAll();
						}}
					>
						Vivant
					</button>
				{/if}
				<div class="dropdown dropdown-right">
					<div tabindex="0" role="button" class="btn btn-ghost m-1">▶️</div>
					<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
					<ul
						tabindex="0"
						class="dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow"
					>
						<li>
							<button
								on:click={(e) => {
									e.preventDefault();
									swapOriginPlayer = player;
									swapModal.showModal();
								}}
							>
								Swap Roles
							</button>
						</li>
					</ul>
				</div>
			{/if}
		</div>
	{/each}
</div>
{#if !showRole}
	<div class="flex flex-col justify-center items-center my-4">
		<p class=" mt-4 mb-2 italic">
			Phase de Jeu - {nightIndex === 0 ? '1ère' : `${nightIndex + 1}ème`} Nuit
		</p>
		<div class="flex flex-row gap-4">
			{#if currentMusic}
				<button class="btn btn-sm btn-ghost" on:click={toggleMusic}>🔊</button>
			{:else}
				<button class="btn btn-sm btn-ghost" on:click={toggleMusic}>🔇</button>
			{/if}
			<span class="inline-flex items-center justify-center">
				{phase.name}
			</span>
			<button class="btn btn-sm btn-primary" on:click={nextPhase}> Suivante </button>
		</div>
	</div>
	<div class="flex flex-row gap-4">
		<button
			class="btn btn-primary btn-sm"
			on:click={async () => {
				await restartGame();
			}}
		>
			Relancer la Partie
		</button>
		<a class="btn btn-secondary btn-sm" href="/new"> Nouvelle Partie </a>
	</div>
	<div class="toast toast-bottom toast-center">
		{#if phase.metadata?.abilities}
			{#each phase.metadata?.abilities as ability}
				<div class="flex flex-row gap-4 justify-between bg-base-200 p-4 rounded-xl">
					<div class="flex flex-col gap-2">
						<p class="text-lg font-bold">{ability.name}</p>
						<p>{ability.description}</p>
					</div>
					{#if ability.usage > 0}
						<div class="flex flex-col items-end gap-2">
							<p class="text-lg font-bold">
								Utilisations restantes: {ability.usage - (ability.used ?? 0)}
							</p>
							<span class="flex flex-col justify-center items-center">
								<button
									class="btn btn-ghost btn-sm"
									disabled={ability.used === ability.usage}
									on:click={() => {
										ability.used = (ability.used ?? 0) + 1;
									}}>✔️</button
								>
							</span>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
{/if}

<dialog bind:this={swapModal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Swap role of {swapOriginPlayer?.name} with ...</h3>
		<div class="py-4">
			<select class="select select-bordered w-full" bind:value={swapDestinationPlayerId}>
				{#each data.players.filter((p) => p.id !== swapOriginPlayer?.id) as player}
					<option value={player.id}>
						{player.name} ({data.roles.find((r) => r.id === player.roleId)?.name})
					</option>
				{/each}
			</select>
		</div>
		<div class="modal-action">
			<form method="dialog" class="flex flex-row justify-between w-full">
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn">Cancel</button>
				<button
					class="btn btn-primary"
					on:click={async () => {
						await swapRoles();
					}}
				>
					Swap
				</button>
			</form>
		</div>
	</div>
</dialog>
