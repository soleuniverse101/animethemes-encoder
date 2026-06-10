import type { TimePosition } from "$lib/mpv/types";
import { JobFilters } from "./job-filters";

export namespace Job {
  // TODO should name serve as Id ?
  export type Name = string;
  // TODO should "ready" state be stored to replace Infinite end bound ?
  export type Bounds = { start: TimePosition; end: TimePosition };
}

export interface Job {
  label: Job.Name;
  bounds: Job.Bounds;
  filters: JobFilters;
}

/** Not reactive by default. */
export const createJob = (
  label: Job.Name,
  bounds: Job.Bounds = { start: 0, end: Number.POSITIVE_INFINITY }
): Job => {
  const job = $state({
    label,
    bounds,
    // TODO move in JobFilters ?
    filters: Object.fromEntries([
      ...JobFilters.requiredFiltersIds.all.map((id) => [id, JobFilters.create(id)])
    ])
  } satisfies Job);
  return job;
};
