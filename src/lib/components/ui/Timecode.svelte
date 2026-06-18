<script lang="ts">
  import { Format } from "$lib/utils/format";

  interface Props {
    time: number;
    duration?: number;
    class?: string;
  }

  let { time, duration, class: _class }: Props = $props();
</script>

{#if duration == null}
  <span class={[_class, "font-mono"]}
    >{time == Number.POSITIVE_INFINITY
      ? Format.toTimecode(0).replaceAll("0", "_")
      : Format.toTimecode(time)}</span
  >
{:else}
  <div class={[_class, "flex items-center gap-1"]}>
    <span class="font-mono">{Format.toTimecode(time)}</span>
    <span>/</span>
    <span class="font-mono">{Format.toTimecode(duration)}</span>
  </div>
{/if}
