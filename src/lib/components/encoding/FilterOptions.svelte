<script lang="ts">
  import { Filters, type FilterId } from "$lib/app/encoding/filter.svelte";
  import { getApp } from "$lib/app/index.svelte";
  import { assertNonNull } from "$lib/utils/assert";
  import Option from "./Option.svelte";

  type Props = { id: FilterId };

  const { id }: Props = $props();

  const app = getApp();

  // FilterOptions shouldn't be mounted if the filter doesn't exist
  const filter = $derived(assertNonNull(app.currentJob.filters[id]));
  const schema = $derived(Filters.schema(id));
</script>

{#if !Filters.optionsEmpty(filter.options)}
  <div class="ml-8">
    <div class="text-sm">
      <Option {schema} bind:value={filter.options} invalidate={() => (filter.value = null)} />
    </div>
  </div>
{/if}
