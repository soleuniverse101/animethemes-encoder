import type { MPVControls } from "$lib/mpv/controls";
import type { UnlistenFn } from "@tauri-apps/api/event";
import hotkeys from "hotkeys-js";
import { commands } from "./commands";

export function registerShortcuts(): UnlistenFn {
  const shortcutsList: string[] = [];
  const controlsShortcuts = {
    space: "playPause",
    right: "forwardSeek",
    left: "backwardSeek",
    "shift+right": "nextFrame",
    "shift+left": "previousFrame"
  } as const satisfies Record<string, MPVControls.ParameterlessCommand>;
  const shortcuts = {
    "ctrl+o": () => commands("mpvView").importFile()
  };
  for (const [keys, command] of Object.entries(controlsShortcuts)) {
    hotkeys(keys, () => {
      commands("mpvView").playback[command]();
    });
    shortcutsList.push(keys);
  }
  for (const [keys, callback] of Object.entries(shortcuts)) {
    hotkeys(keys, () => {
      callback();
    });
    shortcutsList.push(keys);
  }

  return () => {
    for (const shortcut of shortcutsList) {
      hotkeys.unbind(shortcut);
    }
  };
}
