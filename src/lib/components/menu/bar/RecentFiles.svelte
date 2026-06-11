<script lang="ts">
  import { commands } from "$lib/app/commands";
  import { getApp } from "$lib/app/index.svelte";
  import { Menubar } from "bits-ui";
  import MenuItem from "./MenuItem.svelte";

  const app = getApp();
</script>

{#if app.config.recent.length > 0}
  <Menubar.Separator />
  <Menubar.Group>
    <Menubar.GroupHeading>Recent files</Menubar.GroupHeading>
    {#each app.config.recent as path}
      <MenuItem
        // TODO rearrange based on window size
        class="truncate max-w-lg"
        title={path}
        action={{ type: "button", callback: () => commands("mpvView").importFile(path) }}
      />
    {/each}
  </Menubar.Group>
{/if}
