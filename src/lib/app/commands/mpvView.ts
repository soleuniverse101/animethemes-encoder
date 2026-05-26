import { createModule } from ".";

export type MPVViewHandler = {
  importFile: () => Promise<void>;
  playback: {
    playPause: () => Promise<void>;
    nextFrame: () => Promise<void>;
    previousFrame: () => Promise<void>;
  };
};

export const mpvView = createModule<MPVViewHandler>();
