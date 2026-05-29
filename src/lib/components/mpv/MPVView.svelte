<script lang="ts">
  import { registerHandler } from "$lib/app/commands";
  import { MPVWindowManager } from "$lib/mpv/window";
  import { FileUtils } from "$lib/utils/file";
  import { open } from "@tauri-apps/plugin-dialog";
  import MPV from "./MPV.svelte";
  import MPVPlaybackControls from "./MPVPlaybackControls.svelte";

  interface Props {
    mpvWindowManager: MPVWindowManager;
  }

  const { mpvWindowManager }: Props = $props();

  const mpvWindow = await (() => mpvWindowManager)().getOrCreateWindow("mpv", [
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
      await mpvWindow.mpvControls.loadFile(file);
    },
    playback: {
      playPause: async () => await mpvWindow.mpvControls.playPause(),
      forwardSeek: async (duration) => await mpvWindow.mpvControls.forwardSeek(duration),
      backwardSeek: async (duration) => await mpvWindow.mpvControls.backwardSeek(duration),
      nextFrame: async () => await mpvWindow.mpvControls.nextFrame(),
      previousFrame: async () => await mpvWindow.mpvControls.previousFrame(),
      setLoopA: async (position) => await mpvWindow.mpvControls.setLoopA(position),
      setLoopB: async (position) => await mpvWindow.mpvControls.setLoopB(position)
    }
  });
</script>

<div class="flex flex-col items-center">
  <MPV mpvWindowControls={mpvWindow.controls} />
  <MPVPlaybackControls controls={mpvWindow.mpvControls} />
</div>
