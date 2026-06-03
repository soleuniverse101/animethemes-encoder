<script lang="ts">
  import { commands } from "$lib/app/commands";
  import { getApp } from "$lib/app/index.svelte";
  import { Menubar } from "bits-ui";
  import MenuItem from "./MenuItem.svelte";

  const app = getApp();
</script>

<Menubar.Group>
  <Menubar.GroupHeading>Recent files</Menubar.GroupHeading>
  {#each app.config.recent as path}
    <MenuItem
      title={path}
      action={{ type: "button", callback: () => commands("mpvView").importFile(path) }}
    />
  {/each}
</Menubar.Group>
