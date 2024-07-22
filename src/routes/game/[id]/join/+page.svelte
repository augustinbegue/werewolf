<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let form: ActionData;

	onMount(() => {
		if (form) {
			// window.location.href = `/game/${$page.params.id}`;
		}
	});
</script>

<div class="container mx-auto p-4">
	<h1 class="text-2xl font-semibold mb-6">Partie {$page.params.id}</h1>

	<form
		method="POST"
		action="/game/{$page.params.id}/join"
		class="flex flex-col items-start gap-4"
		use:enhance
	>
		<label for="name" class="input input-bordered flex items-center gap-2 w-max">
			Nom:
			<input type="text" id="name" name="name" required />
		</label>
		<button type="submit" class="btn btn-success">Rejoindre</button>
	</form>
</div>
