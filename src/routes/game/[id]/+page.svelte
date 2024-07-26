<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { PageData } from './$types';
	import QRCode from 'qrcode';
	import { invalidateAll } from '$app/navigation';
	import { Howl } from 'howler';

	export let data: PageData;
	let img: HTMLImageElement;

	async function generateQRCode() {
		const url = window.location.href;
		const qrCode = await QRCode.toDataURL(url, {
			errorCorrectionLevel: 'H',
			width: 1024,
			height: 1024
		});
		img.src = qrCode;
	}

	$: me = data.players.find((player) => player.id === data.me);

	$: playerCount = data.players.filter((player) => !player.owner).length;
	$: {
		if (playerCount === data.nbPlayers) {
			clearInterval(timer);
			window.location.href = `/game/${data.id}/play`;
		}
	}

	let timer: number;
	onMount(() => {
		generateQRCode();

		timer = setInterval(() => {
			invalidateAll();
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(timer);
	});
</script>

<div class="container mx-auto p-4 flex flex-col gap-4">
	<h1 class="text-3xl font-semibold font-display">En attente de tout les joueurs</h1>
	<div>
		<img
			bind:this={img}
			class="max-w-64 rounded-xl"
			alt="qrcode"
			on:click={(e) => {
				e.target.requestFullscreen();
			}}
		/>
		<p class="font-body mt-2">Partagez ce QR Code pour rejoindre la partie.</p>
	</div>

	<h2 class="text-2xl font-display">Joueurs ({playerCount}/{data.nbPlayers})</h2>
	<ul>
		{#each data?.players as player}
			<li class="font-body bg-base-200 p-2 rounded-xl px-3 mb-2">
				{player.name}
				{#if me?.owner && player.id !== me.id}
					<button
						on:click={() => {
							fetch(`/api/game/${data.id}/player/${player.id}/kick`, {
								method: 'POST'
							});
						}}
					>
						❌
					</button>
				{/if}
				{#if player.owner}
					<span>(👑)</span>
				{/if}
			</li>
		{/each}
		<p>La partie sera lancée lorsque {data.nbPlayers} joueurs auront rejoins.</p>
	</ul>

	<h2 class="text-2xl font-display">Roles</h2>
	<ul>
		{#each data?.roles as role}
			{#if role.maxCount > 0}
				<li class="font-body bg-base-200 p-2 rounded-xl px-3 mb-2">
					{role.name}: {role.maxCount}
				</li>
			{/if}
		{/each}
	</ul>
</div>
