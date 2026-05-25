<script lang="ts">
  import MPV from "$lib/components/MPV.svelte";
  import MPVTimeline from "$lib/components/MPVTimeline.svelte";
  import { MPVControls } from "$lib/mpv/controls";
  import { MPVWindowManager } from "$lib/mpv/window";
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { open } from "@tauri-apps/plugin-dialog";
  import hotkeys from "hotkeys-js";
  import { onDestroy } from "svelte";

  const mpvWindowManager = new MPVWindowManager(getCurrentWebviewWindow());
  // TODO replace await by hydration
  const mpvWindow = await mpvWindowManager.getOrCreateWindow(undefined, ["pause"]);

  const controlsShortcuts = {
    space: "playPause",
    "shift+right": "nextFrame",
    "shift+left": "previousFrame"
  } as const satisfies Record<string, MPVControls.ParameterlessCommand>;
  const shortcuts = {
    "ctrl+o": importFile
  };
  const shortcutsList: string[] = [];

  for (const [keys, command] of Object.entries(controlsShortcuts)) {
    hotkeys(keys, () => {
      mpvWindow.mpvControls[command]();
    });
    shortcutsList.push(keys);
  }
  for (const [keys, callback] of Object.entries(shortcuts)) {
    hotkeys(keys, () => {
      callback();
    });
    shortcutsList.push(keys);
  }

  onDestroy(async () => {
    for (const shortcut of shortcutsList) {
      hotkeys.unbind(shortcut);
    }
    await mpvWindowManager.destroy();
  });

  async function importFile() {
    const file = await open({ multiple: false, title: "Upload source file" });
    if (file == null) {
      throw new Error(`File not found (${file})`);
    }
    await mpvWindow.mpvControls.loadFile(file);
  }
</script>

<main class="flex h-full w-full flex-col items-center">
  <div class="flex grow flex-col items-center">
    <button onclick={importFile}>Upload source file</button>
    <MPV mpvWindowControls={mpvWindow.controls} />
    <p>Time pos :</p>
  </div>
  <MPVTimeline controls={mpvWindow.mpvControls} />
</main>
