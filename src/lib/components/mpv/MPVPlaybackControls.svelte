<script lang="ts">
  import type { MPVControls } from "$lib/mpv/controls";
  import Icon from "@iconify/svelte";
  import MPVTimeline from "./MPVTimeline.svelte";

  interface Props {
    controls: MPVControls;
  }

  const { controls }: Props = $props();

  const pause = $derived(controls.listenerView.propertyStore("pause"));
</script>

<div class="flex w-full flex-col justify-center pt-2">
  <MPVTimeline {controls} />
  {#snippet button(action: MPVControls.ParameterlessCommand, icon: string, tooltip: string)}
    <button
      onclick={() => controls[action]()}
      title={tooltip}
      class="flex aspect-square h-8 items-center justify-center rounded-full bg-none p-2 transition hover:bg-[rgb(230,225,240)]"
    >
      <Icon {icon} class="h-full" />
    </button>
  {/snippet}
  <div class="flex h-14 grow flex-col justify-center">
    <div class="flex items-center justify-center gap-2 text-[rgb(159,147,184)] transition">
      {@render button("setLoopA", "mdi:contain-start", "Set Loop Start (Shift+Alt+Left)")}
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
      {@render button("setLoopB", "mdi:contain-end", "Set Loop End (Shift+Alt+Right)")}
    </div>
  </div>
</div>
