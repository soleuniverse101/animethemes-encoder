import type { CompilerContext } from "$lib/app/encoding/compilers";
import type { Pass } from "$lib/app/encoding/compilers/export";
import { filters, type Filter } from "$lib/app/encoding/filter.svelte";
import { optionalFiltersIds, requiredFiltersIds, type Filters } from "$lib/app/encoding/job.svelte";

/**
 * @param context {@link CompilerContext}
 * @param type Type of filter (audio or video)
 * @param pass Pass of the filters to compute. Leave out to compute all matching filters regarding
 *   of their associated pass.
 * @returns Joined list of computed filters.
 */
export async function computeFilters<T extends "audio" | "video">(
  context: CompilerContext,
  type: T,
  pass?: Pass
): Promise<string> {
  return (
    await Promise.all(
      listFilters(context.job.filters, type, pass).map((filter) => filter.compute(context))
    )
  ).join(",");
}

// export const filtersComputed = (context: CompilerContext) =>
//   !listFilters(context.job.filters).some((filter) => filter.value == null);

/**
 * @param jobFilters
 * @param type Type of filter (audio or video)
 * @param pass Pass of the filters to list. Leave out to list all matching filters regarding of
 *   their associated pass.
 * @returns A list of all defined filters of a {@link Filters}. Includes all required filters and all
 *   **defined** optional filters.
 */
export function listFilters(
  jobFilters: Filters,
  type: "audio" | "video" | "all",
  pass?: Pass
): Filter[] {
  const output: Filter[] = [];

  for (const id of requiredFiltersIds[type]) {
    const filter = jobFilters[id].filter as Filter;
    const filterPass = filters.all[id].pass;
    if (filterPass == null || filterPass == pass) {
      output.push(filter);
    }
  }
  for (const id of optionalFiltersIds[type]) {
    const filter = jobFilters[id].filter as Filter | null;
    const filterPass = filters.all[id].pass;
    if (filter != null && (filterPass == null || filterPass == pass)) {
      output.push(filter);
    }
  }

  return output;
}

export const joinFilter = (filter: string, args: Record<string, string | number | null>) =>
  `${filter}=${Object.entries(args)
    .map(([arg, val]) => (val != null ? `${arg}=${val}` : arg))
    .join(":")}`;
