import { createContext } from "svelte";
import type { Config } from "./config";
import { Jobs, type Job } from "./encoding/job.svelte";

export interface App {
  config: Config;
  file?: string;
  jobs: Jobs;
  currentJob: Job;
  /** Client UI information for manual rendering by child components. */
  // TODO turn into viewport if introducing side sections
  view: {
    headerHeight: number;
    footerHeight: number;
  };
}

/** Not reactive by default. **IMPORTANT**: config must be set manually. */
export const createApp = (config: Config): App => {
  const jobs = new Jobs(["OP", "ED"]);
  return {
    config,
    // TODO configurable default jobs ?
    jobs,
    currentJob: jobs.list[0],
    view: {
      headerHeight: 0,
      footerHeight: 0
    }
  };
};

export const [getApp, setApp] = createContext<App>();
