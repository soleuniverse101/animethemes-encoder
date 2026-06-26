<script lang="ts">
  import { commands } from "$lib/app/commands";
  import logo from "$lib/assets/logo.svg?raw";
  import { Menubar } from "bits-ui";
  import Menu from "./Menu.svelte";
  import MenuItem from "./MenuItem.svelte";
  import RecentFiles from "./RecentFiles.svelte";

  let value = $state("");

  $effect(() => {
    if (value == "") {
      commands("mpvView").window.show();
    } else {
      commands("mpvView").window.hide();
    }
  });
</script>

<Menubar.Root bind:value class="flex items-stretch px-2 select-none">
  <div class="h-4 my-auto mr-2 flex">
    <!-- TODO secure ? if not, find alternative -->
    {@html logo}
  </div>
  <h1 class="mr-6 font-bold">AnimeThemes Encoder</h1>

  <Menu title="File">
    <MenuItem title="Open..." action={{ type: "commandButton", command: "mpvView.importFile" }} />
    <RecentFiles />
  </Menu>
  <Menu title="Help">
    <MenuItem
      title="AnimeThemes Wiki"
      action={{ type: "link", href: "https://animethemes.moe/wiki/" }}
    />
  </Menu>
</Menubar.Root>
