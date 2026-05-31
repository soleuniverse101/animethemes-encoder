import type { UnlistenFn } from "@tauri-apps/api/event";
import { registerShortcuts } from ".";

export const registerMPVViewShortcuts = (): UnlistenFn =>
  registerShortcuts({
    "ctrl+o": "mpvView.importFile",
    space: "mpvView.playback.playPause",
    right: "mpvView.playback.forwardSeek",
    left: "mpvView.playback.backwardSeek",
    "shift+right": "mpvView.playback.nextFrame",
    "shift+left": "mpvView.playback.previousFrame",
    "shift+alt+left": "mpvView.playback.setJobStartToCurrent",
    "shift+alt+right": "mpvView.playback.setJobEndToCurrent"
  });
