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
    "ab-loop-b",
    "ab-loop-count"
  ]);

  const app = getApp();

  const handlerContext: MPVViewHandlerContext = $state({
    mpvWindow,
    app
  });
  const unlistens = [registerMPVViewHandler(handlerContext), registerMPVViewShortcuts()];

  const { duration } = $derived(mpvWindow.mpvControls.listenerView);
  $effect(() => {
    if (app.file == null || !duration) return;
    if (!Number.isFinite(app.currentJob.bounds.end)) {
      commands("jobs").current.setEnd(duration);
    }
    mpvWindow.mpvControls.setLoop(app.currentJob.bounds);
  });
  $effect(() => {
    if (app.view.overlayCounter.open) {
      mpvWindow.window.hide();
    } else {
      mpvWindow.window.show();
    }
  });

  onDestroy(() => unlistenAll(unlistens));
</script>

<div class="flex flex-col items-center inert:opacity-40" inert={app.file == null}>
  <h2>MPV View</h2>
  <MPV mpvWindowControls={mpvWindow.controls} />
  <MPVPlaybackControls controls={mpvWindow.mpvControls} />
</div>
