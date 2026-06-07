<script lang="ts">
  import { command, type Command } from "$lib/app/commands";
  import { getApp } from "$lib/app/index.svelte";
  import type { MPVControls } from "$lib/mpv/controls";
  import Icon from "@iconify/svelte";
  import { derived } from "svelte/store";
  import Select from "../ui/Select.svelte";
  import MPVTimeline from "./MPVTimeline.svelte";

  interface Props {
    controls: MPVControls;
  }

  let { controls }: Props = $props();

  const pause = $derived(controls.listenerView["pause"]);
  const loop = $derived(derived(controls.listenerView["ab-loop-count"], (count) => count == "inf"));

  const app = getApp();
</script>

<div class="flex w-full flex-col justify-center pt-2">
  <MPVTimeline {controls} />
  {#snippet button(action: Command.Parameterless.Name, icon: string, tooltip: string)}
    <button
      onclick={() => command(action)()}
      title={tooltip}
      class="flex aspect-square h-8 items-center justify-center rounded-full bg-none p-2 transition hover:bg-[rgb(230,225,240)]"
    >
      <Icon {icon} class="h-full" />
    </button>
  {/snippet}
  <div class="flex h-14 justify-around px-1">
    <div class="w-1/4"></div>
    <div class="flex w-1/2 items-center justify-center gap-2 text-[rgb(159,147,184)] transition">
      {@render button(
        "mpvView.playback.setJobStartToCurrent",
        "mdi:contain-start",
        "Set Loop Start (Shift+Alt+Left)"
      )}
      {@render button(
        "mpvView.playback.previousFrame",
        "fluent:previous-frame-24-filled",
        "Previous Frame (Shift+Left)"
      )}
      {@render button(
        "mpvView.playback.backwardSeek",
        "fa6-solid:backward",
        "Backward 5 Seconds (Left)"
      )}
      {@render button(
        "mpvView.playback.playPause",
        $pause == "yes" ? "fa6-solid:play" : "fa6-solid:pause",
        "Play/Pause (Space)"
      )}
      {@render button(
        "mpvView.playback.forwardSeek",
        "fa6-solid:forward",
        "Forward 5 Seconds (Right)"
      )}
      {@render button(
        "mpvView.playback.nextFrame",
        "fluent:next-frame-24-filled",
        "Next Frame (Shift+Right)"
      )}
      {@render button(
        "mpvView.playback.setJobEndToCurrent",
        "mdi:contain-end",
        "Set Loop End (Shift+Alt+Right)"
      )}
    </div>
    <div class="flex items-center w-1/4 justify-end">
      {@render button(
        "mpvView.playback.toggleLoop",
        $loop ? "mdi:repeat" : "mdi:repeat-off",
        "Toggle Loop (Ctrl+L)"
      )}
      <Select
        type="single"
        items={app.jobs
          .keys()
          .toArray()
          .map((id) => ({ value: id, label: id }))}
        bind:value={() => app.currentJob.label, (label) => (app.currentJob = app.jobs.get(label)!)}
      />
    </div>
  </div>
</div>
