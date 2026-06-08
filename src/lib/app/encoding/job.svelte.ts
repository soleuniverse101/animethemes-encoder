import type { TimePosition } from "$lib/mpv/types";
import {
  createFilter,
  Filter,
  filtersIds,
  type AudioFilterId,
  type FilterId,
  type VideoFilterId
} from "./filter.svelte";

export namespace Job {
  export type Name = string;
  // TODO should "ready" state be stored to replace Infinite end bound ?
  export type Bounds = { start: TimePosition; end: TimePosition };
}

// TODO if more needed, move in filter.svelte.ts

const requiredFilters = {
  audio: ["loudnorm"],
  video: []
} as const satisfies { audio: AudioFilterId[]; video: VideoFilterId[] };

type RequiredFilterId =
  | `audio.${(typeof requiredFilters)["audio"][number]}`
  | `video.${(typeof requiredFilters)["video"][number]}`;
export type OptionalFilterId = Exclude<FilterId, RequiredFilterId>;

export type Filters = {
  [Id in RequiredFilterId]: {
    required: true;
    filter: Filter<Id>;
  };
} & {
  [Id in OptionalFilterId]: {
    required: false;
    filter: Filter<Id> | null;
  };
};

// TODO should optional filters be unique ? + make all this readonly ?
const requiredFiltersIds = {
  audio: requiredFilters.audio.map((id) => `audio.${id}`),
  video: requiredFilters.video.map((id) => `video.${id}`)
} as {
  audio: Extract<RequiredFilterId, `audio.${AudioFilterId}`>[];
  video: Extract<RequiredFilterId, `video.${VideoFilterId}`>[];
  all: RequiredFilterId[];
};
requiredFiltersIds.all = [...requiredFiltersIds.audio, ...requiredFiltersIds.video];
const optionalFiltersIds = {
  audio: filtersIds.audio.filter((id) => !(requiredFiltersIds.audio as FilterId[]).includes(id)),
  video: filtersIds.video.filter((id) => !(requiredFiltersIds.video as FilterId[]).includes(id))
} as const as {
  audio: Extract<OptionalFilterId, `audio.${AudioFilterId}`>[];
  video: Extract<OptionalFilterId, `video.${VideoFilterId}`>[];
  all: OptionalFilterId[];
};
optionalFiltersIds.all = [...optionalFiltersIds.audio, ...optionalFiltersIds.video];

export { optionalFiltersIds, requiredFiltersIds };

export interface Job {
  label: Job.Name;
  bounds: Job.Bounds;
  filters: Filters;
}

/** Not reactive by default. */
export const createJob = (
  label: Job.Name,
  bounds: Job.Bounds = { start: 0, end: Number.POSITIVE_INFINITY }
): Job => {
  // TODO should it be $state-ified ?
  const filters: Filters = Object.fromEntries([
    ...requiredFiltersIds.all.map((id) => [id, { required: true, filter: createFilter(id) }]),
    ...optionalFiltersIds.all.map((id) => [id, { required: false, filter: null }])
  ]);
  const job = $state({
    label,
    bounds,
    filters
  } satisfies Job);
  return job;
};
