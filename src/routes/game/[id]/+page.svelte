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

	let music: Howl;
	function startMusic() {
		if (music) {
			music.stop();
		}

		music = new Howl({
			src: ['/assets/music/Lobby.mp3'],
			loop: true
		});
		music.once('load', () => {
			console.log('music loaded');

			music.play();
		});
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
	<h1 class="text-2xl font-semibold">Partie {data?.id}</h1>

	<button class="btn btn-outline" on:click={startMusic}>Start Music</button>

	<div>
		<img
			bind:this={img}
			class="max-w-64"
			alt="qrcode"
			on:click={(e) => {
				e.target.requestFullscreen();
			}}
		/>
		<p>Partagez ce QR Code pour rejoindre la partie.</p>
	</div>

	<fieldset class="border border-solid border-base-content p-3 rounded-md">
		<legend class="text-sm">Joueurs ({playerCount}/{data.nbPlayers})</legend>
		<ul class="list-disc pl-6">
			{#each data?.players as player}
				<li>
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
		</ul>
	</fieldset>

	<fieldset class="border border-solid border-base-content p-3 rounded-md">
		<legend class="text-sm">Roles</legend>
		<ul class="list-disc pl-6">
			{#each data?.roles as role}
				{#if role.maxCount > 0}
					<li>{role.name}: {role.maxCount}</li>
				{/if}
			{/each}
		</ul>
	</fieldset>
	<p>La partie sera lancée lorsque {data.nbPlayers} joueurs auront rejoins.</p>
</div>
