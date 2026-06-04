<script lang="ts">
  import { Menubar } from "bits-ui";
  import Menu from "./Menu.svelte";
  import MenuItem from "./MenuItem.svelte";
  import RecentFiles from "./RecentFiles.svelte";
</script>

<Menubar.Root class="flex px-2 select-none">
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
