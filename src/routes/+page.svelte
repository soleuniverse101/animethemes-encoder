<script lang="ts">
  import MPVView from "$lib/components/MPVView.svelte";
  import type { MPVControls } from "$lib/mpv/controls";
  import type { MPVWindow } from "$lib/mpv/window";
  import { open } from "@tauri-apps/plugin-dialog";
  import hotkeys from "hotkeys-js";
  import { onDestroy } from "svelte";

  let mpvWindow: MPVWindow | null;

  const shortcutsList: string[] = [];
  const controlsShortcuts = {
    space: "playPause",
    "shift+right": "nextFrame",
    "shift+left": "previousFrame"
  } as const satisfies Record<string, MPVControls.ParameterlessCommand>;
  const shortcuts = {
    "ctrl+o": importFile
  };
  for (const [keys, command] of Object.entries(controlsShortcuts)) {
    hotkeys(keys, () => {
      mpvWindow?.mpvControls[command]();
    });
    shortcutsList.push(keys);
  }
  for (const [keys, callback] of Object.entries(shortcuts)) {
    hotkeys(keys, () => {
      callback();
    });
    shortcutsList.push(keys);
  }

  onDestroy(() => {
    for (const shortcut of shortcutsList) {
      hotkeys.unbind(shortcut);
    }
  });

  async function importFile() {
    const file = await open({ multiple: false, title: "Upload source file" });
    if (file == null) {
      throw new Error(`File not found (${file})`);
    }
    // importFile is only called from context where mpvWindow is non null
    await mpvWindow?.mpvControls.loadFile(file);
  }
</script>

<main class="flex h-full w-full flex-col items-center">
  <MPVView bind:mpvWindow />
</main>
