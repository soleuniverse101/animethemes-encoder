import z from "zod";

export type FilterOptionInfo = { title: string };
export const schemaInfo = z.registry<FilterOptionInfo>();

type FilterArgs = Record<string, string | number | boolean>;

export const joinFilter = (filter: string, args: FilterArgs | string | number | boolean) =>
  `${filter}=${
    typeof args == "string"
      ? args
      : typeof args == "number" || typeof args == "boolean"
        ? args.toString()
        : Object.entries(args)
            .map(([arg, val]) => `${arg}=${val}`)
            .join(":")
  }`;

export const createFilterJoiner = (filter: string, baseArgs: FilterArgs) => (args: FilterArgs) =>
  joinFilter(filter, { ...baseArgs, ...args });
