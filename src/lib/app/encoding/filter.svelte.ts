import type { PrefixKeys } from "$lib/utils/types";
import z from "zod";
import type z4 from "zod/v4/core";
import type { CompilerContext } from "./compilers";
import type { Pass } from "./compilers/export";
import { fadeIn, fadeInSchema, fadeOut, fadeOutSchema } from "./filters/audio/afade";
import { loudnorm, loudnormSchema } from "./filters/audio/loudnorm";
import { hqdn3d, hqdn3dSchema } from "./filters/video/hqdn3d";
import { scale, scaleSchema } from "./filters/video/scale";

// TODO maybe make distinction between async & sync and use it to differentiate long compute processes against quick ones
type ComputeFunction<Options extends {}> = (
  context: CompilerContext,
  options: Options
) => string | Promise<string>;

const filtersOptionsSchemasDefinitions = {
  audio: {
    loudnorm: loudnormSchema,
    fadeIn: fadeInSchema,
    fadeOut: fadeOutSchema
  },
  video: {
    scale: scaleSchema,
    hqdn3d: hqdn3dSchema
  }
} as const satisfies Record<"audio" | "video", Record<string, z4.$ZodObject>>;

type OptionsSchemas = typeof filtersOptionsSchemasDefinitions;
// TODO possible to make a FilterType type to generalize audio & video

const filtersOptionsSchemas = Object.fromEntries(
  Object.entries(filtersOptionsSchemasDefinitions).flatMap(([type, filters]) =>
    Object.entries(filters).map(([subId, schema]) => [`${type}.${subId}`, schema])
  )
) as { [Id in keyof OptionsSchemas["audio"] as `audio.${Id}`]: OptionsSchemas["audio"][Id] } & {
  [Id in keyof OptionsSchemas["video"] as `video.${Id}`]: OptionsSchemas["video"][Id];
};

export type AudioFilterId = keyof OptionsSchemas["audio"];
export type VideoFilterId = keyof OptionsSchemas["video"];

type AudioFiltersOptions = {
  [Id in AudioFilterId]: z.infer<OptionsSchemas["audio"][Id]>;
};
type VideoFiltersOptions = {
  [Id in VideoFilterId]: z.infer<OptionsSchemas["video"][Id]>;
};

export type FiltersOptions = PrefixKeys<AudioFiltersOptions, "audio"> &
  PrefixKeys<VideoFiltersOptions, "video">;

export type FilterId = keyof FiltersOptions;

type FilterDescription<Id extends FilterId> = {
  /** Export encoding pass for which to apply the filter. Leave empty to apply on both. */
  pass?: Pass;
  compute: ComputeFunction<FiltersOptions[Id]>;
  description: string;
  defaultOptions: () => FiltersOptions[Id];
};

type FilterDescriptor<Id extends FilterId> = {} extends FiltersOptions[Id]
  ? Omit<FilterDescription<Id>, "defaultOptions">
  : FilterDescription<Id>;
type WithOptionalOptions<Id extends FilterId> = {
  defaultOptions?: () => FiltersOptions[Id];
};
export function createDescription<Id extends FilterId>(
  descriptor: FilterDescriptor<Id>
): FilterDescription<Id> {
  const description = { ...descriptor };
  if (!(description as WithOptionalOptions<Id>).defaultOptions) {
    (description as WithOptionalOptions<Id>).defaultOptions = () => ({}) as FiltersOptions[Id];
  }
  return description as FilterDescription<Id>;
}

const filtersDefinition = {
  audio: {
    loudnorm,
    fadeIn,
    fadeOut
  },
  video: { scale, hqdn3d }
} as const satisfies {
  audio: {
    [Id in AudioFilterId]: FilterDescription<`audio.${Id}`>;
  };
  video: {
    [Id in VideoFilterId]: FilterDescription<`video.${Id}`>;
  };
};

// Separating audio from video to be able to list them at will
const filters = Object.fromEntries(
  Object.entries(filtersDefinition).map(([type, subIds]) => [
    type,
    Object.fromEntries(
      Object.entries(subIds).map(([id, definition]) => [`${type}.${id}`, definition])
    )
  ])
) as {
  audio: { [Id in Extract<FilterId, `audio.${AudioFilterId}`>]: FilterDescription<Id> };
  video: { [Id in Extract<FilterId, `video.${VideoFilterId}`>]: FilterDescription<Id> };
  all: { [Id in FilterId]: FilterDescription<Id> };
};
filters.all = { ...filters.audio, ...filters.video };

interface d {
  get d(): string;
}

export namespace Filters {
  // TODO methods necessary ? useful to prevent set from unauthorized party. could maybe replace by typing filters descriptions propertiers as getters with no setters
  export const pass = <Id extends FilterId>(filter: Id) => filters.all[filter].pass;
  export const compute = <Id extends FilterId>(filter: Id) => filters.all[filter].compute;
  export const defaultOptions = <Id extends FilterId>(filter: Id) =>
    filters.all[filter].defaultOptions();
  export const description = <Id extends FilterId>(filter: Id) => filters.all[filter].description;

  export const schema = <Id extends FilterId>(filter: Id) => filtersOptionsSchemas[filter];
  export const optionsEmpty = (options: {}) => Object.keys(options).length === 0;

  // TODO make readonly
  export const ids = {
    audio: Object.keys(filters.audio),
    video: Object.keys(filters.video)
  } as {
    // TODO turn into a tuple ?
    audio: (keyof (typeof filters)["audio"])[];
    video: (keyof (typeof filters)["video"])[];
    all: (keyof (typeof filters)["all"])[];
  };
  ids.all = [...ids.audio, ...ids.video];
}
