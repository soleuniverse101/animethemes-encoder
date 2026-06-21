<script lang="ts">
  import { commands } from "$lib/app/commands";
  import { initConfig } from "$lib/app/config";
  import App from "$lib/components/App.svelte";
  import { MPVWindowManager } from "$lib/mpv/window";
  import { assertNonNull } from "$lib/utils/assert";
  import { defaultWindowIcon } from "@tauri-apps/api/app";
  import { TrayIcon, type TrayIconOptions } from "@tauri-apps/api/tray";
  import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { onDestroy } from "svelte";

  const config = initConfig();

  const main = getCurrentWebviewWindow();
  const mpvWindowManager = new MPVWindowManager(main);

  // TODO review page lifecycle/organisation between root page and App + move somewhere else ?
  const trayOptions = {
    id: "app",
    title: "AnimeThemes Encoder",
    // TODO print info on runnings job(s)
    tooltip: "AnimeThemes Encoder",
    icon: assertNonNull(await defaultWindowIcon()),
    action: async ({ type }) => {
      if (type != "Click") {
        return;
      }
      // TODO multiple windows ? => maybe don't hide/show all of them ?
      const webviews = await WebviewWindow.getAll();
      if (await main.isVisible()) {
        webviews.forEach((webview) => webview.hide());
      } else {
        webviews.forEach((webview) => webview.show());
        await main.setFocus();
      }
    }
  } satisfies TrayIconOptions;
  const tray = (await TrayIcon.getById(trayOptions.id)) ?? (await TrayIcon.new(trayOptions));

  const unlisten = await main.onCloseRequested(async () => {
    await commands("config").save();
    mpvWindowManager.destroy();
  });

  onDestroy(async () => {
    await tray.close();
    await commands("config").save();
    mpvWindowManager.destroy();
    // TODO why is everything called 2 times ? maybe for reload but check if this is needed in prod
    unlisten();
  });
</script>

{#await config then config}
  <App {config} {mpvWindowManager} />
{/await}
