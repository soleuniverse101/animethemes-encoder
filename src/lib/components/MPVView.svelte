<script lang="ts">
  import type { MPVControls } from "$lib/mpv/controls";
  import { MPVWindow, MPVWindowManager } from "$lib/mpv/window";
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { open } from "@tauri-apps/plugin-dialog";
  import hotkeys from "hotkeys-js";
  import { onDestroy, onMount } from "svelte";
  import MPV from "./MPV.svelte";
  import MPVTimeline from "./MPVTimeline.svelte";

  const main = getCurrentWebviewWindow();
  let mpvWindowManager: MPVWindowManager;
  let mpvWindow: MPVWindow | null = $state(null);

  onMount(async () => {
    mpvWindowManager = new MPVWindowManager(main);
    mpvWindow = await mpvWindowManager.getOrCreateWindow("mpv", ["pause"]);

    // const shortcutsList: string[] = [];
    // const controlsShortcuts = {
    //   space: "playPause",
    //   "shift+right": "nextFrame",
    //   "shift+left": "previousFrame"
    // } as const satisfies Record<string, MPVControls.ParameterlessCommand>;
    // const shortcuts = {
    //   "ctrl+o": importFile
    // };
    // for (const [keys, command] of Object.entries(controlsShortcuts)) {
    //   hotkeys(keys, () => {
    //     mpvWindow.mpvControls[command]();
    //   });
    //   shortcutsList.push(keys);
    // }
    // for (const [keys, callback] of Object.entries(shortcuts)) {
    //   hotkeys(keys, () => {
    //     callback();
    //   });
    //   shortcutsList.push(keys);
    // }
  });
  const unlisten = await main.onCloseRequested(() => {
    mpvWindowManager.destroy();
  });
  onDestroy(async () => {
    // for (const shortcut of shortcutsList) {
    //   hotkeys.unbind(shortcut);
    // }
    await mpvWindowManager.destroy();
    unlisten();
  });

  async function importFile() {
    const file = await open({ multiple: false, title: "Upload source file" });
    if (file == null) {
      throw new Error(`File not found (${file})`);
    }
    // importFile is only called from context where mpvWindow is non null
    await mpvWindow!.mpvControls.loadFile(file);
  }
</script>

<div class="flex h-full w-full flex-col items-center">
  {#if mpvWindow}
    <div class="flex grow flex-col items-center">
      <button onclick={importFile}>Upload source file</button>
      <MPV mpvWindowControls={mpvWindow.controls} />
      <p>Time pos :</p>
    </div>
    <MPVTimeline controls={mpvWindow.mpvControls} />
  {/if}
</div>
