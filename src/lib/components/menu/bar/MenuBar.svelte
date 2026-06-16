<script lang="ts">
  import { commands } from "$lib/app/commands";
  import logo from "$lib/assets/logo.svg?no-inline";
  import EmbedSVG from "$lib/components/ui/EmbedSVG.svelte";
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

<Menubar.Root bind:value class="flex px-2 select-none">
  <EmbedSVG href={logo} title="AnimeThemes Logo" class="h-4 my-auto mr-2" />
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
