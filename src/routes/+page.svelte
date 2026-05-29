<script lang="ts">
  import { registerShortcuts } from "$lib/app/shortcuts";
  import MenuBar from "$lib/components/menu/bar/MenuBar.svelte";
  import MPVView from "$lib/components/mpv/MPVView.svelte";
  import { MPVWindowManager } from "$lib/mpv/window";
  import { unlistenAll } from "$lib/utils/tauri";
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { onDestroy } from "svelte";

  const main = getCurrentWebviewWindow();
  const mpvWindowManager = new MPVWindowManager(main);

  const unlistens = [
    registerShortcuts(),
    await main.onCloseRequested(() => {
      mpvWindowManager.destroy();
    })
  ];

  onDestroy(async () => {
    await mpvWindowManager.destroy();
    unlistenAll(unlistens);
  });
</script>

<header>
  <MenuBar />
</header>
<main class="flex h-full w-full flex-col items-center">
  <MPVView {mpvWindowManager} />
</main>
