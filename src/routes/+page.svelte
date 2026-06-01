<script lang="ts">
  import { version } from "$app/environment";
  import { createApp, setApp } from "$lib/app/index.svelte";
  import EncodingSection from "$lib/components/encoding/EncodingSection.svelte";
  import MenuBar from "$lib/components/menu/bar/MenuBar.svelte";
  import MPVView from "$lib/components/mpv/MPVView.svelte";
  import { MPVWindowManager } from "$lib/mpv/window";
  import { unlistenAll } from "$lib/utils/tauri";
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { onDestroy } from "svelte";

  const main = getCurrentWebviewWindow();
  const mpvWindowManager = new MPVWindowManager(main);

  const app = $state(createApp());
  setApp(app);

  const unlistens = [
    await main.onCloseRequested(() => {
      mpvWindowManager.destroy();
    })
  ];

  onDestroy(async () => {
    await mpvWindowManager.destroy();
    unlistenAll(unlistens);
  });
</script>

<header class="z-10 w-full max-w-4xl sticky top-0 bg-background">
  <MenuBar />
</header>

<main class="py-6 gap-3 grow flex h-max max-w-4xl w-full flex-col items-stretch px-10">
  <MPVView {mpvWindowManager} />
  <EncodingSection />
</main>

<footer class="text-text-400 bg-primary-200 px-1 w-full sticky bottom-0">
  <div class="mx-auto w-full max-w-4xl flex justify-between">
    <span>by <a href="https://soleuniverse.me/">soleuniverse</a></span>
    <span>v{version}</span>
  </div>
</footer>
