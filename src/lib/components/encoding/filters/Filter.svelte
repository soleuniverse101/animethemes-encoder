<script lang="ts">
  import { commands } from "$lib/app/commands";
  import { Filters, type FilterId } from "$lib/app/encoding/filter.svelte";
  import { JobFilters } from "$lib/app/encoding/job-filters";
  import { getApp } from "$lib/app/index.svelte";
  import Icon from "@iconify/svelte";
  import { Label, Switch, useId } from "bits-ui";
  import FilterOptions from "./FilterOptions.svelte";

  type Props = { id: FilterId };

  const { id }: Props = $props();

  const app = getApp();

  const jobFilter = $derived(app.currentJob.filters[id]);
  const required = $derived(JobFilters.isRequiredId(id));

  const checked = $derived(jobFilter != null);
</script>

<div>
  <div class="flex items-center gap-1 mb-1">
    {const rootId = useId()}
    <Switch.Root
      class="text-xl translate-y-0.5"
      disabled={required}
      bind:checked={
        () => checked,
        (checked) => {
          // TODO remove ? bind shouldn't trigger if Select is disabled
          // Ensured id is optional
          if (required) {
            return;
          }
          commands("jobs").current.toggleFilter(id as JobFilters.OptionalFilterId, checked);
        }
      }
      id={rootId}
    >
      <Switch.Thumb title={required ? "Required filter" : "Optional filter"}>
        <Icon icon={checked ? "mdi:toggle-switch" : "mdi:toggle-switch-off"} />
      </Switch.Thumb>
    </Switch.Root>
    <Label.Root class={[checked && "font-bold"]} for={rootId}>{Filters.description(id)}</Label.Root>
  </div>
  {#if checked}
    <FilterOptions {id} />
  {/if}
</div>
