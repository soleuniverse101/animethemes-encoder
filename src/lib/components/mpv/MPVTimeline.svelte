<script lang="ts">
  import type { MPVControls } from "$lib/mpv/controls";
  import Icon from "@iconify/svelte";

  interface Props {
    controls: MPVControls;
  }

  const { controls }: Props = $props();
  const { propertyStore } = $derived(controls.listenerView);

  let pause = $derived(propertyStore("pause"));
</script>

<div class="flex h-16 w-full flex-col justify-center pt-2">
  <div class="h-1 w-full bg-[rgb(230,225,240)]"></div>
  {#snippet button(action: MPVControls.ParameterlessCommand, icon: string)}
    <button
      onclick={() => controls[action]()}
      class="flex aspect-square h-8 items-center justify-center rounded-full bg-none p-2 transition hover:bg-[rgb(230,225,240)]"
    >
      <Icon {icon} class="h-full" />
    </button>
  {/snippet}
  <div class="flex grow flex-col justify-center">
    <div class="flex items-center justify-center gap-2 text-[rgb(159,147,184)] transition">
      {@render button("previousFrame", "fa6-solid:backward-step")}
      {@render button("playPause", $pause == "yes" ? "fa6-solid:play" : "fa6-solid:pause")}
      {@render button("nextFrame", "fa6-solid:forward-step")}
    </div>
  </div>
</div>
