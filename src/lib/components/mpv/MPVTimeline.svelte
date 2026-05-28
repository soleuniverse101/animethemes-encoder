<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";
  import TimeDisplay from "./TimeDisplay.svelte";

  type Props =
    | {
        active: true;
        progress: number;
        timePos: number;
        duration: number;
      }
    | {
        active: false;
        progress: typeof NaN;
        timePos: typeof NaN;
        duration: typeof NaN;
      };

  let { active, progress = $bindable(), timePos, duration }: Props = $props();

  let click = $state(false);

  let sliderRect: DOMRectReadOnly = $state() as DOMRectReadOnly;
  const trigger: MouseEventHandler<Document> = (event) => {
    if (click) {
      progress = (event.clientX - sliderRect.x) / sliderRect.width;
    }
  };
</script>

<svelte:document onmousemove={trigger} onmouseup={() => (click = false)} />

<div class="relative h-10 w-full">
  {#if active}
    <div class="peer absolute bottom-0 h-1/2 w-full"></div>
    <div
      role="slider"
      class="peer/timeline absolute bottom-0 h-2 w-full bg-[rgb(230,225,240)] transition-[height] ease-linear select-none peer-hover:h-full hover:h-full"
      bind:contentRect={sliderRect}
      onmousedown={(event) => {
        if (event.button == 0) {
          progress = (event.clientX - sliderRect.x) / sliderRect.width;
          click = true;
        }
      }}
    >
      <div class="h-full bg-[#319488] transition-[width]" style:width={progress * 100 + "%"}></div>
    </div>
    <TimeDisplay
      {timePos}
      {duration}
      class="pointer-events-none absolute top-1/2 z-10 -translate-y-1/4  opacity-0 transition peer-hover:-translate-y-1/2 peer-hover:opacity-90 peer-hover/timeline:-translate-y-1/2 peer-hover/timeline:opacity-90"
    />
  {/if}
</div>
