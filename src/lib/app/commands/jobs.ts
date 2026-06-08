import type { TimePosition } from "$lib/mpv/types";
import { listFilters } from "$lib/utils/filters";
import { commands, registerHandler } from ".";
import type { App } from "../index.svelte";

export type JobsHandler = {
  current: {
    /** Invalidates precomputed data (such as filters). */
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
        listFilters(app.currentJob.filters, "all").forEach((filter) => filter.invalidate()),
      setStart: (position) => {
        app.currentJob.bounds.start = position;
        commands("jobs").current.invalidateArtifacts();
      },
      setEnd: (position) => {
        app.currentJob.bounds.end = position;
        commands("jobs").current.invalidateArtifacts();
      }
    }
  });
