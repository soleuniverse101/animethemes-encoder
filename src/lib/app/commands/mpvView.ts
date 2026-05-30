import { createModule } from ".";

export type MPVViewHandler = {
  importFile: () => Promise<void>;
  playback: {
    setBoundaryA: () => Promise<void>;
    setBoundaryB: () => Promise<void>;
  };
};

export const mpvView = createModule<MPVViewHandler>();
