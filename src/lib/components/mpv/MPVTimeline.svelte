<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";

  type Props =
    | {
        active: true;
        progress: number;
      }
    | {
        active: false;
        progress: typeof NaN;
      };

  let { active, progress = $bindable() }: Props = $props();

  let click = $state(false);

  let sliderRect: DOMRectReadOnly = $state() as DOMRectReadOnly;
  const onmousemove: MouseEventHandler<Document> = (event) => {
    if (click) {
      progress = (event.clientX - sliderRect.x) / sliderRect.width;
    }
  };
</script>

<svelte:document {onmousemove} onmouseup={() => (click = false)} />

<div class="relative h-10 w-full">
  {#if active}
    <div class="peer peer absolute bottom-0 h-1/2 w-full"></div>
    <div
      role="slider"
      class="absolute bottom-0 h-2 w-full bg-[rgb(230,225,240)] transition-[height] ease-linear select-none peer-hover:h-full hover:h-full"
      bind:contentRect={sliderRect}
      onmousedown={() => (click = true)}
    >
      <div class="h-full bg-[#319488] transition-[width]" style:width={progress * 100 + "%"}></div>
    </div>
  {/if}
</div>
