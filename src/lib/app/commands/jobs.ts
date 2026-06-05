import type { TimePosition } from "$lib/mpv/types";
import { commands, registerHandler } from ".";
import type { App } from "../index.svelte";

export type JobsHandler = {
  current: {
    /** Invalidates precomputed data (loudness normalization stats). */
    invalidateArtifacts: () => void;
    setStart: (position: TimePosition) => void;
    setEnd: (position: TimePosition) => void;
  };
};

export type JobsHandlerContext = {
  app: App;
};

export const registerJobsHandler = ({ app }: JobsHandlerContext) =>
  registerHandler("jobs", {
    current: {
      invalidateArtifacts: () =>
        app.jobs.forEach((job) =>
          Object.values(job.filters.audio).forEach((filter) => filter?.invalidate())
        ),
      setStart: (position) => {
        commands("jobs").current.invalidateArtifacts();
        app.currentJob.bounds.start = position;
      },
      setEnd: (position) => {
        commands("jobs").current.invalidateArtifacts();
        app.currentJob.bounds.end = position;
      }
    }
  });
