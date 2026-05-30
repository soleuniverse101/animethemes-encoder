import type { TimePosition } from "$lib/mpv/types";
import type { MPVWindow } from "$lib/mpv/window";
import { FileUtils } from "$lib/utils/file";
import { open } from "@tauri-apps/plugin-dialog";
import { commands, registerHandler } from ".";
import { type Bounds, type Job } from "../job.svelte";

export type MPVViewHandler = {
  importFile: () => Promise<void>;
  playback: {
    playPause: () => Promise<void>;
    forwardSeek: (duration?: TimePosition) => Promise<void>;
    backwardSeek: (duration?: TimePosition) => Promise<void>;
    nextFrame: () => Promise<void>;
    previousFrame: () => Promise<void>;
    setBoundaryAToCurrent: () => Promise<void>;
    setBoundaryBToCurrent: () => Promise<void>;
  };
};

export type MPVViewHandlerContext = {
  mpvWindow: MPVWindow;
  job: Job;
  currentBoundsLabel: Bounds.Label;
};

export function registerMPVViewHandler(context: MPVViewHandlerContext) {
  registerHandler("mpvView", {
    importFile: async () => {
      const file = await open({ multiple: false, title: "Upload source file" });
      if (file == null) {
        throw new Error(`File not found (${file})`);
      } else if (FileUtils.isVideoFile(file)) {
        throw new Error(`Incorrect extension for video file (${file})`);
      }
      await context.mpvWindow.mpvControls.loadFile(file);
      context.job.file = file;
    },
    playback: {
      playPause: async () => await context.mpvWindow.mpvControls.playPause(),
      forwardSeek: async (duration?: TimePosition) =>
        await context.mpvWindow.mpvControls.forwardSeek(duration),
      backwardSeek: async (duration?: TimePosition) =>
        await context.mpvWindow.mpvControls.backwardSeek(duration),
      nextFrame: async () => await context.mpvWindow.mpvControls.nextFrame(),
      previousFrame: async () => await context.mpvWindow.mpvControls.previousFrame(),
      setBoundaryAToCurrent: async () =>
        commands("job").bounds.setA(
          context.currentBoundsLabel,
          await context.mpvWindow.mpvControls.setLoopAToCurrent()
        ),
      setBoundaryBToCurrent: async () =>
        commands("job").bounds.setB(
          context.currentBoundsLabel,
          await context.mpvWindow.mpvControls.setLoopBToCurrent()
        )
    }
  });
}
