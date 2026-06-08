import type { PrefixKeys } from "$lib/utils/types";
import z from "zod";
import type { CompilerContext } from "./compilers";
import type { Pass } from "./compilers/export";
import { fadeIn, fadeInSchema, fadeOut, fadeOutSchema } from "./filters/audio/afade";
import { loudnorm, loudnormSchema } from "./filters/audio/loudnorm";
import { hqdn3d, hqdn3dSchema } from "./filters/video/hqdn3d";
import { scale, scaleSchema } from "./filters/video/scale";

type ComputeFunction<Options extends {} | null> = Options extends null
  ? (context: CompilerContext) => string | Promise<string>
  : (context: CompilerContext, options: Options) => string | Promise<string>;

// TODO maybe make distinction between async & sync and use it to differentiate long compute processes against quick ones
export class Filter<Id extends FilterId = FilterId> {
  #value: string | null = $state(null);
  private computeFunction: ComputeFunction<FiltersOptions[Id]>;

  options: FiltersOptions[Id];

  constructor(parameters: {
    compute: ComputeFunction<FiltersOptions[Id]>;
    options: FiltersOptions[Id];
  }) {
    this.computeFunction = parameters.compute;
    this.options = parameters.options;
  }

  invalidate() {
    this.#value = null;
  }

  /** @returns Computed value of the filter. Skips computation if value is already defined. */
  async compute(context: CompilerContext): Promise<string> {
    if (this.#value != null) return this.#value;
    return (this.#value =
      this.options == null
        ? await (this.computeFunction as ComputeFunction<null>)(context)
        : await (this.computeFunction as ComputeFunction<{}>)(context, this.options));
  }

  get value() {
    return this.#value;
  }
}

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
} as const;

type OptionsSchemas = typeof filtersOptionsSchemasDefinitions;

const filtersOptionsSchemas = {
  audio: Object.fromEntries([
    ...Object.entries(filtersOptionsSchemasDefinitions.audio).map(([subId, schema]) => [
      `audio.${subId}`,
      schema
    ])
  ]),
  video: Object.fromEntries([
    ...Object.entries(filtersOptionsSchemasDefinitions.video).map(([subId, schema]) => [
      `video.${subId}`,
      schema
    ])
  ])
} as {
  audio: { [Id in keyof OptionsSchemas["audio"] as `audio.${Id}`]: OptionsSchemas["audio"][Id] };
  video: { [Id in keyof OptionsSchemas["video"] as `video.${Id}`]: OptionsSchemas["video"][Id] };
  all: (typeof filtersOptionsSchemas)["audio"] & (typeof filtersOptionsSchemas)["video"];
};
filtersOptionsSchemas.all = { ...filtersOptionsSchemas.audio, ...filtersOptionsSchemas.video };

export { filtersOptionsSchemas };

export type AudioFilterId = keyof OptionsSchemas["audio"];
export type VideoFilterId = keyof OptionsSchemas["video"];

type AudioFiltersOptions = {
  [Id in AudioFilterId]: OptionsSchemas["audio"][Id] extends null
    ? null
    : z.infer<OptionsSchemas["audio"][Id]>;
};
type VideoFiltersOptions = {
  [Id in VideoFilterId]: OptionsSchemas["video"][Id] extends null
    ? null
    : z.infer<OptionsSchemas["video"][Id]>;
};

export type FiltersOptions = PrefixKeys<AudioFiltersOptions, "audio"> &
  PrefixKeys<VideoFiltersOptions, "video">;

export type FilterId = keyof FiltersOptions;

type FilterDescription<Id extends FilterId> = {
  /** Export encoding pass for which to apply the filter. Leave empty to apply on both. */
  pass?: Pass;
  compute: ComputeFunction<FiltersOptions[Id]>;
  description: string;
} & (FiltersOptions[Id] extends null
  ? {}
  : {
      defaultOptions: () => FiltersOptions[Id];
    });

export function createDescription<Id extends FilterId>(
  description: FilterDescription<Id>
): FilterDescription<Id> {
  return description;
}

const filtersDefinition: {
  audio: {
    [Id in AudioFilterId]: FilterDescription<`audio.${Id}`>;
  };
  video: {
    [Id in VideoFilterId]: FilterDescription<`video.${Id}`>;
  };
} = {
  audio: {
    loudnorm,
    fadeIn,
    fadeOut
  },
  video: { scale, hqdn3d }
};

export const filters = Object.fromEntries(
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
export const filtersIds = {
  audio: Object.keys(filters.audio),
  video: Object.keys(filters.video)
} as {
  audio: (keyof (typeof filters)["audio"])[];
  video: (keyof (typeof filters)["video"])[];
  all: (keyof (typeof filters)["all"])[];
};
filtersIds.all = [...filtersIds.audio, ...filtersIds.video];

type WithOptionalOptions<Id extends FilterId> = {
  defaultOptions?: () => FiltersOptions[Id];
};
export function createFilter<Id extends FilterId>(id: Id): Filter<Id> {
  const filter = filters.all[id];
  const options = $state(
    (filter as WithOptionalOptions<Id>).defaultOptions
      ? (filter as WithOptionalOptions<Id>).defaultOptions!()
      : null
  );
  return new Filter({ compute: filter.compute, options: options as FiltersOptions[Id] });
}

export function filterDescription<Id extends FilterId>(filter: Id) {
  return filters.all[filter].description;
}
