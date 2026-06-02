import { platform } from "@tauri-apps/plugin-os";
import { createContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";
import type { Job } from "./encoding/job.svelte";

/** Not reactive by default. */
export const createJob = (
  label: Job.Name,
  bounds: Job.Bounds = { start: 0, end: Number.POSITIVE_INFINITY }
): Job => ({ label, bounds, normalizationFilters: null });

export interface App {
  file?: string;
  jobs: SvelteMap<Job.Name, Job>;
  currentJob: Job;
}

/** Not reactive by default. */
export const createApp = (): App => {
  const defaultJob = createJob("OP");
  return {
    jobs: new SvelteMap([[defaultJob.label, defaultJob]]),
    currentJob: defaultJob
  };
};

export const [getApp, setApp] = createContext<App>();

const os = platform();
if (os != "linux" && os != "windows") {
  throw new Error("OSes other than Linux and Windows are currently not supported.");
}
export { os };
