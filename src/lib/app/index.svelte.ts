import { createContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";
import type { Config } from "./config";
import { createJob, type Job } from "./encoding/job.svelte";

export interface App {
  config: Config;
  file?: string;
  jobs: SvelteMap<Job.Name, Job>;
  currentJob: Job;
}

/** Not reactive by default. **IMPORTANT**: config must be set manually. */
export const createApp = (config: Config): App => {
  const defaultJob = createJob("OP");
  return {
    config,
    jobs: new SvelteMap([[defaultJob.label, defaultJob]]),
    currentJob: defaultJob
  };
};

export const [getApp, setApp] = createContext<App>();
