<script lang="ts">
  import { commands } from "$lib/app/commands";
  import { registerJobsHandler } from "$lib/app/commands/jobs";
  import { initConfig } from "$lib/app/config";
  import { registerConfigHandler } from "$lib/app/config/handler";
  import { createApp, setApp } from "$lib/app/index.svelte";
  import App from "$lib/components/App.svelte";
  import { MPVWindowManager } from "$lib/mpv/window";
  import { unlistenAll } from "$lib/utils/tauri";
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { onDestroy } from "svelte";

  const app = $state(createApp());
  setApp(app);
  const config = $state(await initConfig());
  app.config = config;

  const main = getCurrentWebviewWindow();
  const mpvWindowManager = new MPVWindowManager(main);

  const unlistens = [
    registerConfigHandler({ app }),
    registerJobsHandler({ app }),
    await main.onCloseRequested(async () => {
      await commands("config").save();
      mpvWindowManager.destroy();
      unlistenAll(unlistens);
    })
  ];

  onDestroy(async () => {
    mpvWindowManager.destroy();
    unlistenAll(unlistens);
  });
</script>

<App {mpvWindowManager} />
