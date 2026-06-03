<script lang="ts">
  import { Menubar } from "bits-ui";
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    children?: Snippet;
  }

  let { title, children }: Props = $props();
</script>

<Menubar.Menu>
  <Menubar.Trigger>{title}</Menubar.Trigger>
  <Menubar.Content align="start">
    {@render children?.()}
  </Menubar.Content>
</Menubar.Menu>
