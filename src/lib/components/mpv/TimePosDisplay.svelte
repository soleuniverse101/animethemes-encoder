<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";

  type Props = {
    timePos: number;
    duration: number;
  } & Pick<SvelteHTMLElements["div"], "class">;

  let { timePos, duration, class: _class }: Props = $props();

  const formatter = new Intl.DurationFormat(undefined, { style: "digital", hoursDisplay: "auto" });

  let pos = $derived(Temporal.Duration.from({ milliseconds: Math.round(timePos * 1000) }));
  let dur = $derived(Temporal.Duration.from({ milliseconds: Math.round(duration * 1000) }));
</script>

<div class={_class + " flex items-center gap-1 p-2 align-middle font-mono"}>
  <span>{formatter.format(pos)}</span>
  <span>/</span>
  <span>{formatter.format(dur)}</span>
</div>
