<script lang="ts" module>
  import type { Info } from "./InfoEntries.svelte";
  import InfoEntries from "./InfoEntries.svelte";
</script>

<script lang="ts">
  interface Props {
    sections: Info[];
  }

  const { sections }: Props = $props();
</script>

<table class="grid w-full grid-cols-2">
  <InfoEntries entries={sections} />
</table>
