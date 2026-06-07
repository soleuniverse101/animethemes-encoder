import type { TimePosition } from "$lib/mpv/types";
import type { MPVWindow } from "$lib/mpv/window";
import { FileUtils } from "$lib/utils/file";
import { commands, registerHandler } from ".";
import type { App } from "../index.svelte";

export type MPVViewHandler = {
  importFile: (path?: string) => Promise<void>;
  playback: {
    playPause: () => Promise<void>;
    forwardSeek: (duration?: TimePosition) => Promise<void>;
    backwardSeek: (duration?: TimePosition) => Promise<void>;
    nextFrame: () => Promise<void>;
    previousFrame: () => Promise<void>;
    setJobStartToCurrent: () => Promise<void>;
    setJobEndToCurrent: () => Promise<void>;
    toggleLoop: () => Promise<void>;
  };
};

export type MPVViewHandlerContext = {
  mpvWindow: MPVWindow;
  app: App;
};

export const registerMPVViewHandler = ({ mpvWindow, app }: MPVViewHandlerContext) =>
  registerHandler("mpvView", {
    importFile: async (path) => {
      // TODO add validation of path
      let file: string;
      if (path) {
        file = path;
      } else {
        file = await FileUtils.promptVideoFile();
      }
      await mpvWindow.mpvControls.loadFile(file);
      app.file = file;
      commands("config").recent.add(file);
    },
    playback: {
      playPause: async () => await mpvWindow.mpvControls.playPause(),
      forwardSeek: async (duration?: TimePosition) =>
        await mpvWindow.mpvControls.forwardSeek(duration),
      backwardSeek: async (duration?: TimePosition) =>
        await mpvWindow.mpvControls.backwardSeek(duration),
      nextFrame: async () => await mpvWindow.mpvControls.nextFrame(),
      previousFrame: async () => await mpvWindow.mpvControls.previousFrame(),
      setJobStartToCurrent: async () =>
        commands("jobs").current.setStart(await mpvWindow.mpvControls.setLoopAToCurrent()),
      setJobEndToCurrent: async () =>
        commands("jobs").current.setEnd(await mpvWindow.mpvControls.setLoopBToCurrent()),
      toggleLoop: async () => await mpvWindow.mpvControls.toggleLoop()
    }
  });
