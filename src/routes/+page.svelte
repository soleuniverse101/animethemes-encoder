<script lang="ts">
  import { registerShortcuts } from "$lib/app/shortcuts";
  import MenuBar from "$lib/components/menu/bar/MenuBar.svelte";
  import MPVView from "$lib/components/mpv/MPVView.svelte";
  import { onDestroy } from "svelte";

  const unlisten = registerShortcuts();
  onDestroy(() => unlisten());
</script>

<header>
  <MenuBar />
</header>
<main class="flex h-full w-full flex-col items-center">
  <MPVView />
</main>
