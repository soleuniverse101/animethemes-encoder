<script lang="ts">
  import MPV from "$lib/components/MPV.svelte";
  import MPVTimeline from "$lib/components/MPVTimeline.svelte";
  import { MPVControls } from "$lib/mpv/controls";
  import { open } from "@tauri-apps/plugin-dialog";
  import hotkeys from "hotkeys-js";
  import { onDestroy } from "svelte";

  const mpvControls = new MPVControls();

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
      mpvControls[command]();
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

  let importButton: HTMLButtonElement;
  async function importFile() {
    const file = await open({ multiple: false, title: "Upload source file" });
    if (file == null) {
      throw new Error(`File not found (${file})`);
    }
    await mpvControls.loadFile(file);
  }
</script>

<main class="flex h-full w-full flex-col items-center">
  <div class="flex grow flex-col items-center">
    <button
      bind:this={importButton}
      onclick={
        importFile
      }
      tabindex="-1">Upload source file</button
    >
    <MPV label={mpvControls.label}></MPV>
    <p>Time pos : {""}</p>
  </div>
  <MPVTimeline controls={mpvControls} />
</main>
