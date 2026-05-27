<script lang="ts">
  import { registerShortcuts } from "$lib/app/shortcuts";
  import MPVView from "$lib/components/mpv/MPVView.svelte";
  import { onDestroy } from "svelte";

  const unlisten = registerShortcuts();
  onDestroy(() => unlisten());
</script>

<main class="flex h-full w-full flex-col items-center">
  <MPVView />
</main>
