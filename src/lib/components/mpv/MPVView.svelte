<script lang="ts">
  import { registerHandler } from "$lib/app/commands";
  import { MPVWindow, MPVWindowManager } from "$lib/mpv/window";
  import { FileUtils } from "$lib/utils/file";
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { open } from "@tauri-apps/plugin-dialog";
  import { onDestroy, onMount } from "svelte";
  import MPV from "./MPV.svelte";
  import MPVPlaybackControls from "./MPVPlaybackControls.svelte";

  const main = getCurrentWebviewWindow();
  let mpvWindowManager: MPVWindowManager;
  // TODO shouldn't be null
  let mpvWindow: MPVWindow | null = $state(null);

  onMount(async () => {
    mpvWindowManager = new MPVWindowManager(main);
    mpvWindow = await mpvWindowManager.getOrCreateWindow("mpv", [
      "duration",
      "time-pos/full",
      "pause",
      "ab-loop-a",
      "ab-loop-b"
    ]);

    registerHandler("mpvView", {
      importFile: async () => {
        const file = await open({ multiple: false, title: "Upload source file" });
        if (file == null) {
          throw new Error(`File not found (${file})`);
        } else if (FileUtils.isVideoFile(file)) {
          throw new Error(`Incorrect extension for video file (${file})`);
        }
        await mpvWindow?.mpvControls.loadFile(file);
      },
      playback: {
        playPause: async () => await mpvWindow?.mpvControls.playPause(),
        forwardSeek: async (duration) => await mpvWindow?.mpvControls.forwardSeek(duration),
        backwardSeek: async (duration) => await mpvWindow?.mpvControls.backwardSeek(duration),
        nextFrame: async () => await mpvWindow?.mpvControls.nextFrame(),
        previousFrame: async () => await mpvWindow?.mpvControls.previousFrame(),
        setLoopA: async (position) => await mpvWindow?.mpvControls.setLoopA(position),
        setLoopB: async (position) => await mpvWindow?.mpvControls.setLoopB(position)
      }
    });
  });
  const unlisten = await main.onCloseRequested(() => {
    mpvWindowManager.destroy();
  });
  onDestroy(async () => {
    await mpvWindowManager.destroy();
    unlisten();
  });
</script>

<div class="flex flex-col items-center">
  {#if mpvWindow}
    <MPV mpvWindowControls={mpvWindow.controls} />
    <MPVPlaybackControls controls={mpvWindow.mpvControls} />
  {/if}
</div>
