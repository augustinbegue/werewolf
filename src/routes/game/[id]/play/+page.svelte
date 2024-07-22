<script lang="ts">
	import type { PageData } from './$types';

	import PlayerView from '$lib/views/play/player-view.svelte';
	import OwnerView from '$lib/views/play/owner-view.svelte';

	export let data: PageData;
</script>

<div class="container mx-auto p-4 flex flex-col gap-4 items-center h-screen justify-center">
	{#if data.me && !data.me?.owner}
		<PlayerView roles={data.roles} me={data.me} />
	{:else if data.me && data.me?.owner}
		<OwnerView {data} />
	{/if}
</div>
