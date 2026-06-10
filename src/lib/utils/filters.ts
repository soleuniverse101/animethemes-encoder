import type { CompilerContext } from "$lib/app/encoding/compilers";
import type { Pass } from "$lib/app/encoding/compilers/export";
import { Filters, type FilterId } from "$lib/app/encoding/filter.svelte";
import { JobFilters, type JobFilter } from "$lib/app/encoding/job-filters";

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
      listFilters(context.job.filters, type, pass).map(
        async ({ id, jobFilter }) =>
          jobFilter.value ??
          (jobFilter.value = await Filters.compute(id)(context, jobFilter.options))
      )
    )
  ).join(",");
}

/**
 * @param jobFilters
 * @param type Type of filter (audio or video)
 * @param pass Pass of the filters to list. Leave out to list all matching filters regarding of
 *   their associated pass.
 * @returns A list of all defined filters of a {@link Filters}. Includes all required filters and all
 *   **defined** optional filters.
 */
export function listFilters(
  jobFilters: JobFilters,
  type: "audio" | "video" | "all",
  pass?: Pass
): { id: FilterId; jobFilter: JobFilter<FilterId> }[] {
  const output: { id: FilterId; jobFilter: JobFilter<FilterId> }[] = [];

  for (const id of JobFilters.requiredFiltersIds[type]) {
    const jobFilter = jobFilters[id];
    const filterPass = Filters.pass(id);
    if (filterPass == null || filterPass == pass) {
      output.push({ id, jobFilter });
    }
  }
  for (const id of JobFilters.optionalFiltersIds[type]) {
    const jobFilter = jobFilters[id];
    const filterPass = Filters.pass(id);
    if (jobFilter != null && (filterPass == null || filterPass == pass)) {
      output.push({ id, jobFilter });
    }
  }

  return output;
}
