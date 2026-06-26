<script lang="ts">
  import { getApp } from "$lib/app/index.svelte";
  import type { MPVWindowControls } from "$lib/mpv/window";
  import { Positions, Sizes } from "$lib/utils/dpi";
  import { type UnlistenFn } from "@tauri-apps/api/event";
  import { onDestroy, onMount } from "svelte";

  interface Props {
    mpvWindowControls: MPVWindowControls;
  }

  let { mpvWindowControls }: Props = $props();

  let mpvDiv: HTMLDivElement;

  const {
    view: { headerHeight, footerHeight }
  } = $derived(getApp());
  const viewport = $derived({
    x: 0,
    y: headerHeight,
    width: window.window.innerWidth,
    height: window.window.innerHeight - headerHeight - footerHeight
  });

  async function alignPlayer() {
    const mpvRect = mpvDiv.getBoundingClientRect();

    await mpvWindowControls.setSize(Sizes.fromBoundingRect(mpvRect, viewport));
    await mpvWindowControls.setPosition(Positions.fromBoundingRect(mpvRect, viewport));
  }

  onMount(() => {
    alignPlayer();
  });

  let unlisten: UnlistenFn;
  // Using $effect because $derived doesn't compute the value until it's read
  $effect(() => {
    unlisten = mpvWindowControls.subscribeTo.move(() => alignPlayer(), mpvWindowControls.label);
  });

  onDestroy(() => unlisten());
</script>

<svelte:window
  onscroll={() => alignPlayer()}
  onresize={({ currentTarget: w }) => {
    viewport.width = w.innerWidth;
    viewport.height = w.innerHeight - headerHeight - footerHeight;
    alignPlayer();
  }}
/>

<div bind:this={mpvDiv} class="aspect-video w-full bg-primary-200"></div>
