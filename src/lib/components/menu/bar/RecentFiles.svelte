<script lang="ts">
  import { commands } from "$lib/app/commands";
  import { getApp } from "$lib/app/index.svelte";
  import Icon from "@iconify/svelte";
  import { Menubar } from "bits-ui";
  import MenuItem from "./MenuItem.svelte";

  const app = getApp();
  const { recent } = $derived(app.config);
</script>

{#if app.config.recent.length > 0}
  <Menubar.Separator />
  <Menubar.Group>
    <Menubar.GroupHeading>Recent files</Menubar.GroupHeading>
    {#each recent as path, index}
      <!-- TODO set variable for hover color -->
      <div class="flex justify-between hover:bg-primary-400">
        <MenuItem
          // TODO rearrange based on window size
          class="truncate max-w-lg"
          title={path}
          action={{ type: "button", callback: () => commands("mpvView").importFile(path) }}
        />
        <!-- TODO use variables to set height & width (probably same as line height) -->
        <button
          onclick={() => recent.splice(index, 1)}
          class="h-6 w-6 flex items-center justify-center bg-none cursor-auto"
        >
          <Icon icon="mdi:remove" />
        </button>
      </div>
    {/each}
  </Menubar.Group>
{/if}
