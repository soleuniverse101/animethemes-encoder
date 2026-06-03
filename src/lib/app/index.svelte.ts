import { createContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";
import type { Config } from "./config";
import type { Job } from "./encoding/job";

/** Not reactive by default. */
export const createJob = (
  label: Job.Name,
  bounds: Job.Bounds = { start: 0, end: Number.POSITIVE_INFINITY }
): Job => ({ label, bounds, normalizationFilters: null });

export interface App {
  config: Config;
  file?: string;
  jobs: SvelteMap<Job.Name, Job>;
  currentJob: Job;
}

/** Not reactive by default. **IMPORTANT**: config must be set manually. */
export const createApp = (): App => {
  const defaultJob = createJob("OP");
  return {
    config: null as any,
    jobs: new SvelteMap([[defaultJob.label, defaultJob]]),
    currentJob: defaultJob
  };
};

export const [getApp, setApp] = createContext<App>();
