<script lang="ts">
  import { Format } from "$lib/utils/format";
  import type { SvelteHTMLElements } from "svelte/elements";

  type Props = {
    timePos: number;
    duration: number;
  } & Pick<SvelteHTMLElements["div"], "class">;

  let { timePos, duration, class: _class }: Props = $props();

  let pos = $derived(Format.toTimecode(timePos));
  let dur = $derived(Format.toTimecode(duration));
</script>

<div class={_class + " flex items-center gap-1 align-middle font-mono"}>
  <span>{pos}</span>
  <span>/</span>
  <span>{dur}</span>
</div>
