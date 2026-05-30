import { registerShortcuts } from ".";
import type { Bounds } from "../job.svelte";

export const registerMPVViewShortcuts = (context: { currentBoundsLabel: Bounds.Label }) =>
  registerShortcuts({
    "ctrl+o": "mpvView.importFile",
    space: "mpvView.playback.playPause",
    right: "mpvView.playback.forwardSeek",
    left: "mpvView.playback.backwardSeek",
    "shift+right": "mpvView.playback.nextFrame",
    "shift+left": "mpvView.playback.previousFrame",
    "shift+alt+left": "mpvView.playback.setBoundaryAToCurrent",
    "shift+alt+right": "mpvView.playback.setBoundaryBToCurrent"
  });
