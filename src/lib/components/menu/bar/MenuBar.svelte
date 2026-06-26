<script lang="ts">
  import { getApp } from "$lib/app/index.svelte";
  import logo from "$lib/assets/logo.svg?raw";
  import { Menubar } from "bits-ui";
  import Menu from "./Menu.svelte";
  import MenuItem from "./MenuItem.svelte";
  import RecentFiles from "./RecentFiles.svelte";

  let value = $state("");

  const app = getApp();
  const id = $props.id();
  const setOverlayOpen = app.view.overlayCounter.getOverlaySetter(id);
</script>

<Menubar.Root
  bind:value={
    () => value,
    (v) => {
      value = v;
      setOverlayOpen(value != "");
    }
  }
  class="flex items-stretch px-2 select-none"
>
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
