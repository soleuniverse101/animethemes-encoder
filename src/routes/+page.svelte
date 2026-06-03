<script lang="ts">
  import { commands } from "$lib/app/commands";
  import { initConfig } from "$lib/app/config";
  import App from "$lib/components/App.svelte";
  import { MPVWindowManager } from "$lib/mpv/window";
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { onDestroy } from "svelte";

  const config = initConfig();

  const main = getCurrentWebviewWindow();
  const mpvWindowManager = new MPVWindowManager(main);

  const unlisten = await main.onCloseRequested(async () => {
    await commands("config").save();
    mpvWindowManager.destroy();
  });

  onDestroy(async () => {
    await commands("config").save();
    mpvWindowManager.destroy();
    unlisten();
  });
</script>

{#await config then config}
  <App {config} {mpvWindowManager} />
{/await}
