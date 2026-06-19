import type { TimePosition } from "$lib/mpv/types";
import { listFilters } from "$lib/utils/filters";
import { commands, registerHandler } from ".";
import { JobFilters } from "../encoding/job-filters";
import type { Job } from "../encoding/job.svelte";
import type { App } from "../index.svelte";

export type JobsHandler = {
  /** Invalidates precomputed data (such as filters) for all jobs. */
  invalidateArtifacts: () => void;
  current: {
    /** Invalidates precomputed data (such as filters). */
    invalidateArtifacts: () => void;
    setStart: (position: TimePosition) => void;
    setEnd: (position: TimePosition) => void;
    /**
     * Set or unset an optional filter. If set is not provided, the filter will be toggled (set if
     * it's unset, unset if it's set)
     *
     * @param filterId
     * @param set
     */
    toggleFilter: (filterId: JobFilters.OptionalFilterId, set?: boolean) => void;
  };
};

export type JobsHandlerContext = {
  app: App;
};

// TODO move in job.svelte.ts ?
function invalidateArtifacts(job: Job) {
  listFilters(job.filters, "all").forEach(({ jobFilter }) => (jobFilter.value = null));
}

export const registerJobsHandler = ({ app }: JobsHandlerContext) =>
  registerHandler("jobs", {
    invalidateArtifacts: () => app.jobs.list.forEach(invalidateArtifacts),
    current: {
      invalidateArtifacts: () => invalidateArtifacts(app.currentJob),
      setStart: (position) => {
        app.currentJob.bounds.start = position;
        commands("jobs").current.invalidateArtifacts();
      },
      setEnd: (position) => {
        app.currentJob.bounds.end = position;
        commands("jobs").current.invalidateArtifacts();
      },
      toggleFilter: (filterId, set) => {
        set = set ?? !(filterId in app.currentJob.filters);
        if (set) {
          app.currentJob.filters = {
            ...app.currentJob.filters,
            [filterId]: JobFilters.create(filterId)
          };
        } else {
          delete app.currentJob.filters[filterId];
        }
      }
    }
  });
