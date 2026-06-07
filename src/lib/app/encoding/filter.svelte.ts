import type { PrefixKeys } from "$lib/utils/types";
import z from "zod";
import type { CompilerContext } from "./compilers";
import { normalizationPass, toFiltersList } from "./compilers/loudnorm";
import { fadeIn, fadeInSchema, fadeOut, fadeOutSchema } from "./filters/afade";

type ComputeFunction<Options extends {}> = (
  context: CompilerContext,
  options: Options
) => string | Promise<string>;

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
    return this.#value ?? (this.#value = await this.computeFunction(context, this.options));
  }

  get value() {
    return this.#value;
  }
}

const filtersOptionsSchemasDefinitions = {
  audio: {
    normalization: z.object({}),
    fadeIn: fadeInSchema,
    fadeOut: fadeOutSchema
  },
  video: {}
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
  [Id in AudioFilterId]: z.infer<OptionsSchemas["audio"][Id]>;
};
type VideoFiltersOptions = {
  [Id in VideoFilterId]: z.infer<OptionsSchemas["video"][Id]>;
};

export type FiltersOptions = PrefixKeys<AudioFiltersOptions, "audio"> &
  PrefixKeys<VideoFiltersOptions, "video">;

export type FilterId = keyof FiltersOptions;

type FilterDescription<Id extends FilterId> = {
  compute: ComputeFunction<FiltersOptions[Id]>;
  defaultOptions: () => FiltersOptions[Id];
  description: string;
};

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
    normalization: {
      compute: async (context) => {
        return toFiltersList(
          JSON.parse((await normalizationPass(context).build().execute()).stdout)
        );
      },
      defaultOptions: () => ({}),
      description: "Loudness normalization"
    },
    fadeIn,
    fadeOut
  },
  video: {}
};

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
export const filtersIds = {
  audio: Object.keys(filters.audio),
  video: Object.keys(filters.video)
} as {
  audio: (keyof (typeof filters)["audio"])[];
  video: (keyof (typeof filters)["video"])[];
  all: (keyof (typeof filters)["all"])[];
};
filtersIds.all = [...filtersIds.audio, ...filtersIds.video];

export function createFilter<Id extends FilterId>(id: Id): Filter<Id> {
  const filter = filters.all[id];
  const options = $state(filter.defaultOptions());
  return new Filter({ compute: filter.compute, options });
}

export function filterDescription<Id extends FilterId>(filter: Id) {
  return filters.all[filter].description;
}
