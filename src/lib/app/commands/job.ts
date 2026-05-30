import type { TimePosition } from "$lib/mpv/types";
import { assertNonNull } from "$lib/utils/assert";
import { registerHandler } from ".";
import type { Bounds, Job } from "../job.svelte";

export type JobHandler = {
  bounds: {
    setA: (label: Bounds.Label, position?: TimePosition) => void;
    setB: (label: Bounds.Label, position?: TimePosition) => void;
  };
};

export function registerJobHandler(job: Job) {
  registerHandler("job", {
    bounds: {
      setA(label, position) {
        assertNonNull(job.bounds.get(label)).a = position;
      },
      setB(label, position) {
        assertNonNull(job.bounds.get(label)).b = position;
      }
    }
  });
}
