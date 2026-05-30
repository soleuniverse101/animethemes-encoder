<script lang="ts">
  import { registerHandler } from "$lib/app/commands";
  import { getJob } from "$lib/app/job";
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

  const job = getJob();

  let currentBoundIndex = $state(0);
  let currentBound = $derived(job.bounds[currentBoundIndex]);
  $effect(() => {
    mpvWindow.mpvControls.setLoop(currentBound);
  });

  registerHandler("mpvView", {
    importFile: async () => {
      const file = await open({ multiple: false, title: "Upload source file" });
      if (file == null) {
        throw new Error(`File not found (${file})`);
      } else if (FileUtils.isVideoFile(file)) {
        throw new Error(`Incorrect extension for video file (${file})`);
      }
      await mpvWindow.mpvControls.loadFile(file);
      job.file = file;
    },
    playback: {
      setBoundaryA: async () => {
        currentBound.a = await mpvWindow.mpvControls.setLoopAToCurrent();
      },
      setBoundaryB: async () => {
        currentBound.b = await mpvWindow.mpvControls.setLoopBToCurrent();
      }
    }
  });
</script>

<div class="flex flex-col items-center">
  <MPV mpvWindowControls={mpvWindow.controls} />
  <MPVPlaybackControls controls={mpvWindow.mpvControls} bind:currentBoundIndex />
</div>
