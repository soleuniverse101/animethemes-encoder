<script lang="ts">
  import { commands } from "$lib/app/commands";
  import { registerMPVViewHandler, type MPVViewHandlerContext } from "$lib/app/commands/mpvView";
  import { getApp } from "$lib/app/index.svelte";
  import { registerMPVViewShortcuts } from "$lib/app/shortcuts/mpvView";
  import { MPVWindowManager } from "$lib/mpv/window";
  import { unlistenAll } from "$lib/utils/tauri";
  import { onDestroy } from "svelte";
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

  const app = getApp();

  const handlerContext: MPVViewHandlerContext = $state({
    mpvWindow,
    app
  });
  const unlistens = [registerMPVViewHandler(handlerContext), registerMPVViewShortcuts()];

  const duration = mpvWindow.mpvControls.listenerView.duration;
  $effect(() => {
    if (app.file == null) return;
    if (app.currentJob.bounds.end == Number.POSITIVE_INFINITY && $duration) {
      commands("jobs").current.setEnd($duration);
    }
  });

  onDestroy(() => unlistenAll(unlistens));
</script>

<div
  class="flex flex-col items-center data-disabled:pointer-events-none data-disabled:opacity-40"
  data-disabled={app.file != null ? null : "true"}
>
  <h2>MPV View</h2>
  <MPV mpvWindowControls={mpvWindow.controls} />
  <MPVPlaybackControls
    controls={mpvWindow.mpvControls}
    bind:currentJobLabel={
      () => app.currentJob.label, (label) => (app.currentJob = app.jobs.get(label)!)
    }
  />
</div>
