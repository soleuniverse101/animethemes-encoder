<script lang="ts">
  import { commands } from "$lib/app/commands";
  import { getJob } from "$lib/app/job.svelte";
  import type { MPVControls } from "$lib/mpv/controls";
  import { assertNonNull } from "$lib/utils/assert";
  import Icon from "@iconify/svelte";
  import { Select } from "bits-ui";
  import MPVTimeline from "./MPVTimeline.svelte";

  interface Props {
    controls: MPVControls;
    currentBoundLabel: string;
  }

  let { controls, currentBoundLabel = $bindable() }: Props = $props();

  const pause = $derived(controls.listenerView.propertyStore("pause"));

  const job = getJob();
  const bounds = $derived(assertNonNull(job.bounds.get(currentBoundLabel)));

  const { setBoundaryAToCurrent, setBoundaryBToCurrent } =
    commands("mpvView").playback;
  type Callback = () => void;
</script>

<div class="flex w-full flex-col justify-center pt-2">
  <MPVTimeline {controls} {bounds} />
  {#snippet button(
    action: MPVControls.ParameterlessCommand | Callback,
    icon: string,
    tooltip: string
  )}
    <button
      onclick={() => (typeof action == "string" ? controls[action]() : action())}
      title={tooltip}
      class="flex aspect-square h-8 items-center justify-center rounded-full bg-none p-2 transition hover:bg-[rgb(230,225,240)]"
    >
      <Icon {icon} class="h-full" />
    </button>
  {/snippet}
  <div class="flex h-14 justify-around">
    <div></div>
    <div class="flex items-center justify-center gap-2 text-[rgb(159,147,184)] transition">
      {@render button(setBoundaryAToCurrent, "mdi:contain-start", "Set Loop Start (Shift+Alt+Left)")}
      {@render button(
        "previousFrame",
        "fluent:previous-frame-24-filled",
        "Previous Frame (Shift+Left)"
      )}
      {@render button("backwardSeek", "fa6-solid:backward", "Backward 5 Seconds (Left)")}
      {@render button(
        "playPause",
        $pause == "yes" ? "fa6-solid:play" : "fa6-solid:pause",
        "Play/Pause (Space)"
      )}
      {@render button("forwardSeek", "fa6-solid:forward", "Forward 5 Seconds (Right)")}
      {@render button("nextFrame", "fluent:next-frame-24-filled", "Next Frame (Shift+Right)")}
      {@render button(setBoundaryBToCurrent, "mdi:contain-end", "Set Loop End (Shift+Alt+Right)")}
    </div>
    <Select.Root type="single" bind:value={currentBoundLabel}>
      <Select.Trigger>
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content>
          <Select.Viewport>
            {#each job.bounds.keys() as label}
              <Select.Item value={label} {label}>{label}</Select.Item>
            {/each}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  </div>
</div>
