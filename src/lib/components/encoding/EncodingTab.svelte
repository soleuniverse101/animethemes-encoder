<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children?: Snippet;
    class?: string;
  }

  let { children, class: _class }: Props = $props();
</script>

<div class={["p-2 bg-primary-300 gap-2", _class]}>{@render children?.()}</div>
