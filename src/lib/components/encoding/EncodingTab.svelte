<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="p-2 bg-primary-300 gap-2">{@render children?.()}</div>
