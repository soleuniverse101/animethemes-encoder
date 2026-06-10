import {
  Filters,
  type AudioFilterId,
  type FilterId,
  type FiltersOptions,
  type VideoFilterId
} from "./filter.svelte";

// Add required filters here
const requiredFilters = {
  audio: ["loudnorm"],
  video: []
} as const satisfies { audio: AudioFilterId[]; video: VideoFilterId[] };

export namespace JobFilters {
  export type RequiredFilterId =
    | `audio.${(typeof requiredFilters)["audio"][number]}`
    | `video.${(typeof requiredFilters)["video"][number]}`;
  export type OptionalFilterId = Exclude<FilterId, RequiredFilterId>;

  // TODO should optional filters be unique ? + make all this readonly ?
  export const requiredFiltersIds = {
    audio: requiredFilters.audio.map((id) => `audio.${id}`),
    video: requiredFilters.video.map((id) => `video.${id}`)
  } as {
    audio: Extract<RequiredFilterId, `audio.${AudioFilterId}`>[];
    video: Extract<RequiredFilterId, `video.${VideoFilterId}`>[];
    all: RequiredFilterId[];
  };
  requiredFiltersIds.all = [...requiredFiltersIds.audio, ...requiredFiltersIds.video];

  export const optionalFiltersIds = {
    audio: Filters.ids.audio.filter((id) => !(requiredFiltersIds.audio as FilterId[]).includes(id)),
    video: Filters.ids.video.filter((id) => !(requiredFiltersIds.video as FilterId[]).includes(id))
  } as const as {
    audio: Extract<OptionalFilterId, `audio.${AudioFilterId}`>[];
    video: Extract<OptionalFilterId, `video.${VideoFilterId}`>[];
    all: OptionalFilterId[];
  };
  optionalFiltersIds.all = [...optionalFiltersIds.audio, ...optionalFiltersIds.video];

  export const isRequiredId = (id: FilterId): id is RequiredFilterId =>
    (requiredFiltersIds.all as FilterId[]).includes(id);
  export const isOptionalId = (id: FilterId): id is OptionalFilterId =>
    (optionalFiltersIds.all as FilterId[]).includes(id);

  export const create = <Id extends FilterId>(id: Id): JobFilter<Id> => ({
    options: Filters.defaultOptions(id),
    value: null
  });
}

export type JobFilter<Id extends FilterId> = {
  options: FiltersOptions[Id];
  value: string | null;
};
export type JobFilters = {
  [Id in JobFilters.RequiredFilterId]: JobFilter<Id>;
} & {
  [Id in JobFilters.OptionalFilterId]?: JobFilter<Id>;
};
