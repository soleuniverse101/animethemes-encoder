<script lang="ts">
  import { getApp } from "$lib/app/index.svelte";
  import type { MPVControls } from "$lib/mpv/controls";
  import { assertNonNull } from "$lib/utils/assert";
  import { clamp, Nullable } from "$lib/utils/math";
  import TimePosDisplay from "./TimePosDisplay.svelte";

  interface Props {
    controls: MPVControls;
  }

  const { controls }: Props = $props();
  const {
    listenerView: { "time-pos/full": timePos, duration }
  } = $derived(controls);

  let progress = $derived(Nullable.div($timePos, $duration));

  const {
    currentJob: {
      bounds: { start, end }
    }
  } = $derived(getApp());
  let loopStart = $derived(Nullable.div(start, $duration));
  let loopEnd = $derived(Nullable.div(end, $duration));

  let sliding = $state(false);

  let slider: HTMLDivElement;
  const updatePosition = async (clickX: number) => {
    const rect = slider.getBoundingClientRect();
    await controls.setPosition(
      clamp((clickX - rect.x) / rect.width, 0, 1) * assertNonNull($duration)
    );
  };

  const posFormatter = new Intl.DurationFormat(undefined, {
    style: "long"
  });
  let roundedTimePos = $derived(Nullable.round($timePos));
</script>

<svelte:document
  onmousemove={({ clientX }) => {
    if (sliding) {
      updatePosition(clientX);
    }
  }}
  onmouseup={() => (sliding = false)}
/>

{#snippet loopMarker(type: "start" | "end", progress: number)}
  <div
    class="pointer-events-none absolute h-full w-3 border-4 border-[rgb(159,147,184)]"
    class:-translate-x-1={type == "start"}
    class:-translate-x-2={type == "end"}
    style:left={`${progress * 100}%`}
    style={`border-${type == "start" ? "right" : "left"}: none`}
  ></div>
{/snippet}

<div bind:this={slider} class="h-10 relative w-full flex flex-col justify-center">
  <div class="h-4/5 w-full relative bg-[rgb(230,225,240)]">
    {#if progress != null}
      <div
        class="h-full w-full"
        onmousedown={async ({ button, clientX }) => {
          if (button == 0) {
            updatePosition(clientX);
            sliding = true;
          }
        }}
        role="slider"
        tabindex="0"
        aria-valuemin="0"
        aria-valuemax={$duration}
        aria-valuenow={roundedTimePos}
        aria-valuetext={roundedTimePos
          ? posFormatter.format(Temporal.Duration.from({ seconds: roundedTimePos }))
          : null}
      >
        <div
          class="h-full bg-[#319488] transition-[width]"
          style:width={progress * 100 + "%"}
        ></div>
      </div>
      {#if $timePos != null && $duration != null}
        <TimePosDisplay
          timePos={$timePos}
          duration={$duration}
          class="pointer-events-none top-1/2 -translate-y-1/2 absolute right-2 opacity-40"
        />
      {/if}
    {/if}
  </div>
  {#if loopStart != null}
    {@render loopMarker("start", loopStart)}
  {/if}
  {#if loopEnd != null}
    {@render loopMarker("end", loopEnd)}
  {/if}
</div>
