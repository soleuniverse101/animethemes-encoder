import type { TimePosition } from "$lib/mpv/types";
import { listFilters } from "$lib/utils/filters";
import { commands, registerHandler } from ".";
import { JobFilters } from "../encoding/job-filters";
import type { App } from "../index.svelte";

export type JobsHandler = {
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

export const registerJobsHandler = ({ app }: JobsHandlerContext) =>
  registerHandler("jobs", {
    current: {
      invalidateArtifacts: () =>
        listFilters(app.currentJob.filters, "all").forEach(
          ({ jobFilter }) => (jobFilter.value = null)
        ),
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
