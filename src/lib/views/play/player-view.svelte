<script lang="ts">
	import type { Player, Role } from '@prisma/client';

	import cards from '$lib/cards.json';
	import { invalidateAll } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

	export let me: Player;
	export let roles: Role[];

	$: roleName = roles.find((r) => r.id === me?.roleId)?.name;

	let showRole = false;

	let timeout: number;
	onMount(() => {
		timeout = setInterval(() => {
			invalidateAll();
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(timeout);
	});
</script>

{#if me.dead}
	<p
		class="text-6xl md:text-8xl font-bold text-red-500 absolute z-50 rotate-12 shadow-2xl font-serif"
		transition:fade
	>
		WASTED
	</p>
{/if}

<div
	class:blur-xl={!showRole || me.dead}
	class:grayscale={!showRole || me.dead}
	class="flex flex-col items-center justify-center transition-all"
>
	<p class="text-xl">Ton role est <b>{roleName}</b></p>

	<img src={cards.find((r) => r.name === roleName)?.image} alt="" class="max-w-64" />

	<p class="text-center">
		{@html cards.find((r) => r.name === roleName)?.description}
	</p>
</div>

<button
	class="btn btn-outline"
	on:click={() => {
		showRole = !showRole;
	}}
	disabled={me.dead}
>
	{!showRole ? 'Afficher' : 'Cacher'} ton role
</button>
