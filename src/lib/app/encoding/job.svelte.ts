import type { TimePosition } from "$lib/mpv/types";
import { assertNonNull } from "$lib/utils/assert";
import { normalizationPass, toFiltersList } from "./compilers/loudnorm";
import { AsyncFilter, Filter } from "./filters.svelte";

export namespace Job {
  export type Name = `${"OP" | "ED"}`;
  export type Bounds = { start: TimePosition; end: TimePosition };
}

export interface Job {
  label: Job.Name;
  bounds: Job.Bounds;
  filters: {
    video: {};
    audio: {
      normalization: AsyncFilter;
      startFade: Filter | null;
      endFade: Filter | null;
    };
  };
}

/** Not reactive by default. */
export const createJob = (
  label: Job.Name,
  bounds: Job.Bounds = { start: 0, end: Number.POSITIVE_INFINITY }
): Job => {
  const job = $state({
    label,
    bounds,
    filters: {
      video: {},
      audio: {
        normalization: new AsyncFilter(async (context) => {
          return toFiltersList(
            JSON.parse((await normalizationPass(assertNonNull(context)).build().execute()).stdout)
          );
        }),
        startFade: null,
        endFade: null
      }
    }
  });
  return job;
};
