<script lang="ts">
  import { createFilter, filterDescription, type FilterId } from "$lib/app/encoding/filter.svelte";
  import { getApp } from "$lib/app/index.svelte";
  import Icon from "@iconify/svelte";
  import { Label, Switch, useId } from "bits-ui";
  import FilterOptions from "./FilterOptions.svelte";

  type Props = { id: FilterId };

  const { id }: Props = $props();

  const app = getApp();

  const jobFilter = $derived(app.currentJob.filters[id]);
</script>

{#if jobFilter.required}
  <!-- TODO -->
{:else}
  {let checked = $derived(jobFilter.filter != null)}
  <div>
    <div class="flex items-center gap-1 mb-1">
      {const rootId = useId()}
      <Switch.Root
        class="text-xl translate-y-0.5"
        bind:checked={
          () => checked,
          (checked) => {
            if (checked) {
              // TODO check type
              jobFilter.filter = createFilter(id) as (typeof jobFilter)["filter"];
            } else {
              jobFilter.filter = null;
            }
          }
        }
        id={rootId}
      >
        <Switch.Thumb>
          {#if checked}
            <Icon icon="mdi:toggle-switch" />
          {:else}
            <Icon icon="mdi:toggle-switch-off" />
          {/if}
        </Switch.Thumb>
      </Switch.Root>
      <Label.Root class={[checked && "font-bold"]} for={rootId}>{filterDescription(id)}</Label.Root>
    </div>
    {#if checked}
      <FilterOptions {id} />
    {/if}
  </div>
{/if}
