import { createContext } from "svelte";
import type { Config } from "./config";
import { Jobs, type Job } from "./encoding/job.svelte";
import { OverlayCounter } from "./view/overlay-counter.svelte";

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
    overlayCounter: OverlayCounter;
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
      footerHeight: 0,
      overlayCounter: new OverlayCounter()
    }
  };
};

// TODO change once https://github.com/sveltejs/svelte/issues/18471 clears
const [getApp, _setApp] = createContext<App>();
const [_getOverlayCounter, setOverlayCounter] = createContext<OverlayCounter>();
const setApp = (app: App) => {
  const _app = _setApp(app);
  setOverlayCounter(app.view.overlayCounter);
  return _app;
};
const getOverlayCounter = () => {
  try {
    return _getOverlayCounter();
  } catch {
    return null;
  }
};
export { setApp, getApp, getOverlayCounter };
