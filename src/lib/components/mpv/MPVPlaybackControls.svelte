<script lang="ts">
  import { command, type Command } from "$lib/app/commands";
  import { getApp } from "$lib/app/index.svelte";
  import type { MPVControls } from "$lib/mpv/controls";
  import Icon from "@iconify/svelte";
  import { Select } from "bits-ui";
  import MPVTimeline from "./MPVTimeline.svelte";

  interface Props {
    controls: MPVControls;
    currentJobLabel: string;
  }

  let { controls, currentJobLabel = $bindable() }: Props = $props();

  const pause = $derived(controls.listenerView["pause"]);

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
  <div class="flex h-14 justify-around">
    <div></div>
    <div class="flex items-center justify-center gap-2 text-[rgb(159,147,184)] transition">
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
    <div class="flex items-center">
      <Select.Root type="single" bind:value={currentJobLabel}>
        <Select.Trigger class="flex min-w-12 items-center justify-between">
          <Select.Value />
          <Icon icon="mdi:chevron-up-down" class="h-full" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              {#each app.jobs.keys() as label}
                <Select.Item value={label} {label}>{label}</Select.Item>
              {/each}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  </div>
</div>
