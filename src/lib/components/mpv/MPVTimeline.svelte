<script lang="ts">
  import type { MPVControls } from "$lib/mpv/controls";
  import { clamp } from "$lib/utils/math";
  import { derived } from "svelte/store";
  import TimePosDisplay from "./TimePosDisplay.svelte";

  interface Props {
    controls: MPVControls;
  }

  const { controls }: Props = $props();
  const { propertyStore } = $derived(controls.listenerView);

  let timePos = $derived(derived(propertyStore("time-pos/full"), (v) => v ?? NaN));
  let duration = $derived(derived(propertyStore("duration"), (v) => v ?? NaN));
  let progress = $derived.by(() => {
    if (!Number.isNaN($timePos) && !Number.isNaN($duration)) {
      return $timePos / $duration;
    }
    return null;
  });
  let loopA = $derived(derived(propertyStore("ab-loop-a"), (t) => (t ?? NaN) / $duration));
  let loopB = $derived(derived(propertyStore("ab-loop-b"), (t) => (t ?? NaN) / $duration));

  let sliding = $state(false);

  let slider: HTMLDivElement;
  const updatePosition = async (clickX: number) => {
    const rect = slider.getBoundingClientRect();
    await controls.setPosition(clamp((clickX - rect.x) / rect.width, 0, 1) * $duration);
  };

  const posFormatter = new Intl.DurationFormat(undefined, {
    style: "long"
  });
  let roundedTimePos = $derived(Math.round($timePos));
</script>

<svelte:document
  onmousemove={({ clientX }) => {
    if (sliding) {
      updatePosition(clientX);
    }
  }}
  onmouseup={() => (sliding = false)}
/>

{#snippet loopMarker(type: "a" | "b", progress: number)}
  <div
    class="pointer-events-none absolute h-full w-3 border-4 border-[rgb(159,147,184)]"
    class:-translate-x-1={type == "a"}
    class:-translate-x-2={type == "b"}
    style:left={`${progress * 100}%`}
    style={`border-${type == "a" ? "right" : "left"}: none`}
  ></div>
{/snippet}

<div bind:this={slider} class="relative h-10 w-full flex flex-col justify-center">
  {#if progress != null}
    <div
      class="h-4/5 w-full bg-[rgb(230,225,240)] select-none"
      // bind:contentRect={sliderRect}
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
      aria-valuetext={posFormatter.format(Temporal.Duration.from({ seconds: roundedTimePos }))}
    >
      <div class="h-full bg-[#319488] transition-[width]" style:width={progress * 100 + "%"}></div>
    </div>
    <TimePosDisplay
      timePos={$timePos}
      duration={$duration}
      class="pointer-events-none absolute right-2 opacity-40"
    />
    {#if $loopA}
      {@render loopMarker("a", $loopA)}
    {/if}
    {#if $loopB}
      {@render loopMarker("b", $loopB)}
    {/if}
  {/if}
</div>
