<script lang="ts">
  import type { MPVWindowControls } from "$lib/mpv/window";
  import { Positions, Sizes } from "$lib/utils/dpi";
  import { type UnlistenFn } from "@tauri-apps/api/event";
  import { onDestroy, onMount } from "svelte";

  interface Props {
    mpvWindowControls: MPVWindowControls;
  }

  let { mpvWindowControls }: Props = $props();

  let mpvDiv: HTMLDivElement;

  async function alignPlayer() {
    const mpvRect = mpvDiv.getBoundingClientRect();
    await movePlayer(mpvRect);
    await mpvWindowControls.setSize(Sizes.fromBoundingRect(mpvRect));
  }
  async function movePlayer(mpvRect = mpvDiv.getBoundingClientRect()) {
    await mpvWindowControls.setPosition(Positions.fromBoundingRect(mpvRect));
  }

  onMount(() => alignPlayer());

  let unlisten: UnlistenFn;
  // Using $effect because $derived doesn't compute the value until it's read
  $effect(() => {
    unlisten = mpvWindowControls.subscribeTo.move(() => alignPlayer(), mpvWindowControls.label);
  });

  onDestroy(() => unlisten());
</script>

<svelte:window onresize={alignPlayer} />

<!-- TODO shouldn't MPVView control the size ? -->
<div bind:this={mpvDiv} class="h-[360px] w-[640px] bg-primary-300"></div>
