<script lang="ts">
  import { registerMPVViewHandler, type MPVViewHandlerContext } from "$lib/app/commands/mpvView";
  import { getJob } from "$lib/app/job.svelte";
  import { MPVWindowManager } from "$lib/mpv/window";
  import { assertNonNull } from "$lib/utils/assert";
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

  const handlerContext: MPVViewHandlerContext = $state({
    mpvWindow,
    job,
    currentBoundsLabel: assertNonNull(job.bounds.keys().next().value)
  });
  registerMPVViewHandler(handlerContext);

  const currentBound = $derived(assertNonNull(job.bounds.get(handlerContext.currentBoundsLabel)));
  $effect(() => {
    mpvWindow.mpvControls.setLoop(currentBound);
  });
</script>

<div class="flex flex-col items-center">
  <MPV mpvWindowControls={mpvWindow.controls} />
  <MPVPlaybackControls
    controls={mpvWindow.mpvControls}
    bind:currentBoundLabel={handlerContext.currentBoundsLabel}
  />
</div>
