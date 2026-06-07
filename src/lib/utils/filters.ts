import type { CompilerContext } from "$lib/app/encoding/compilers";
import { type Filter } from "$lib/app/encoding/filter.svelte";
import { optionalFiltersIds, requiredFiltersIds, type Filters } from "$lib/app/encoding/job.svelte";

export async function computeFilters<T extends "audio" | "video">(
  context: CompilerContext,
  type: T
): Promise<string> {
  return (
    await Promise.all(
      listFilters(context.job.filters, type).map((filter) => filter.compute(context))
    )
  ).join(",");
}

// export const filtersComputed = (context: CompilerContext) =>
//   !listFilters(context.job.filters).some((filter) => filter.value == null);

/**
 * @returns A list of all defined filters of a {@link Filters}. Includes all required filters and all
 *   **defined** optional filters.
 */
export function listFilters(jobFilters: Filters, type: "audio" | "video" | "all"): Filter[] {
  const filters: Filter[] = [];

  for (const id of requiredFiltersIds[type]) {
    filters.push(jobFilters[id].filter as Filter);
  }
  for (const id of optionalFiltersIds[type]) {
    const { filter } = jobFilters[id];
    if (filter != null) {
      filters.push(filter as Filter);
    }
  }

  return filters;
}

export const joinFilter = (filter: string, args: Record<string, string | number>) =>
  `${filter}=${Object.entries(args)
    .map(([arg, val]) => `${arg}=${val}`)
    .join(":")}`;
