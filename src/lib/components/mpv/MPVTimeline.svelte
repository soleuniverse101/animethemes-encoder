<script lang="ts">
  import type { MPVControls } from "$lib/mpv/controls";
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

  let sliderRect: DOMRectReadOnly = $state() as DOMRectReadOnly;
  const updatePosition = async (clickX: number) => {
    await controls.setPosition(((clickX - sliderRect.x) / sliderRect.width) * $duration);
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
    class="pointer-events-none absolute bottom-1 h-8 w-3 translate-y-1/2 border-4 border-[rgb(159,147,184)] transition-all peer-hover:bottom-1/2 peer-hover:h-16 peer-hover/timeline:bottom-1/2 peer-hover/timeline:h-16"
    class:-translate-x-1={type == "a"}
    class:-translate-x-2={type == "b"}
    style:left={`${progress * 100}%`}
    style={`border-${type == "a" ? "right" : "left"}: none`}
  ></div>
{/snippet}

<div class="relative h-10 w-full">
  {#if progress != null}
    <div class="peer absolute bottom-0 h-1/2 w-full"></div>
    <div
      class="peer/timeline absolute bottom-0 h-2 w-full bg-[rgb(230,225,240)] transition-[height] ease-linear select-none peer-hover:h-full hover:h-full"
      bind:contentRect={sliderRect}
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
      class="pointer-events-none absolute top-1/2 -translate-y-1/4 opacity-0 transition peer-hover:-translate-y-1/2 peer-hover:opacity-90 peer-hover/timeline:-translate-y-1/2 peer-hover/timeline:opacity-90"
    />
    {#if $loopA}
      {@render loopMarker("a", $loopA)}
    {/if}
    {#if $loopB}
      {@render loopMarker("b", $loopB)}
    {/if}
  {/if}
</div>
