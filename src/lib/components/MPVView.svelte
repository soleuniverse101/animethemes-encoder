<script lang="ts">
  import { MPVWindow, MPVWindowManager } from "$lib/mpv/window";
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { onDestroy, onMount } from "svelte";
  import MPV from "./MPV.svelte";
  import MPVTimeline from "./MPVTimeline.svelte";

  interface Props {
    mpvWindow: MPVWindow | null;
  }

  let { mpvWindow = $bindable(null) }: Props = $props();

  const main = getCurrentWebviewWindow();
  let mpvWindowManager: MPVWindowManager;

  onMount(async () => {
    mpvWindowManager = new MPVWindowManager(main);
    mpvWindow = await mpvWindowManager.getOrCreateWindow("mpv", ["pause"]);
  });
  const unlisten = await main.onCloseRequested(() => {
    mpvWindowManager.destroy();
  });
  onDestroy(async () => {
    await mpvWindowManager.destroy();
    unlisten();
  });
</script>

<div class="flex h-full w-full flex-col items-center">
  {#if mpvWindow}
    <div class="flex grow flex-col items-center">
      <MPV mpvWindowControls={mpvWindow.controls} />
      <p>Time pos :</p>
    </div>
    <MPVTimeline controls={mpvWindow.mpvControls} />
  {/if}
</div>
