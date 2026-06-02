import type { TimePosition } from "$lib/mpv/types";

export namespace Job {
  export type Name = `${"OP" | "ED"}`;
  export type Bounds = { start: TimePosition; end: TimePosition };
}

export interface Job {
  label: Job.Name;
  bounds: Job.Bounds;
  normalizationFilters: string | null;
}
