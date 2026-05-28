import { createModule } from ".";

export type MPVViewHandler = {
  importFile: () => Promise<void>;
  playback: {
    playPause: () => Promise<void>;
    forwardSeek: (duration?: number) => Promise<void>;
    backwardSeek: (duration?: number) => Promise<void>;
    nextFrame: () => Promise<void>;
    previousFrame: () => Promise<void>;
    setLoopA: (position?: number) => Promise<void>;
    setLoopB: (position?: number) => Promise<void>;
  };
};

export const mpvView = createModule<MPVViewHandler>();
