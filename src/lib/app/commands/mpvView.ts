import type { TimePosition } from "$lib/mpv/types";
import type { MPVWindow } from "$lib/mpv/window";
import { FileUtils } from "$lib/utils/file";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { registerHandler } from ".";
import type { App } from "../index.svelte";

export type MPVViewHandler = {
  importFile: () => Promise<void>;
  playback: {
    playPause: () => Promise<void>;
    forwardSeek: (duration?: TimePosition) => Promise<void>;
    backwardSeek: (duration?: TimePosition) => Promise<void>;
    nextFrame: () => Promise<void>;
    previousFrame: () => Promise<void>;
    setJobStartToCurrent: () => Promise<void>;
    setJobEndToCurrent: () => Promise<void>;
  };
};

export type MPVViewHandlerContext = {
  mpvWindow: MPVWindow;
  app: App;
};

export const registerMPVViewHandler = ({ mpvWindow, app }: MPVViewHandlerContext): UnlistenFn =>
  registerHandler("mpvView", {
    importFile: async () => {
      const file = await FileUtils.promptVideoFile();
      await mpvWindow.mpvControls.loadFile(file);
      app.file = file;
    },
    playback: {
      playPause: async () => await mpvWindow.mpvControls.playPause(),
      forwardSeek: async (duration?: TimePosition) =>
        await mpvWindow.mpvControls.forwardSeek(duration),
      backwardSeek: async (duration?: TimePosition) =>
        await mpvWindow.mpvControls.backwardSeek(duration),
      nextFrame: async () => await mpvWindow.mpvControls.nextFrame(),
      previousFrame: async () => await mpvWindow.mpvControls.previousFrame(),
      setJobStartToCurrent: async () => {
        app.currentJob.bounds.start = await mpvWindow.mpvControls.setLoopAToCurrent();
      },
      setJobEndToCurrent: async () => {
        app.currentJob.bounds.end = await mpvWindow.mpvControls.setLoopBToCurrent();
      }
    }
  });
