<script lang="ts">
  import { filtersOptionsSchemas, type FilterId } from "$lib/app/encoding/filter.svelte";
  import { getApp } from "$lib/app/index.svelte";
  import { assertNonNull } from "$lib/utils/assert";
  import Option from "./Option.svelte";

  type Props = { id: FilterId };

  const { id }: Props = $props();

  const app = getApp();

  let filter = $derived(assertNonNull(app.currentJob.filters[id].filter));
</script>

<div class="ml-8">
  <div class="text-sm">
    <Option
      schema={filtersOptionsSchemas.all[id]}
      bind:value={() => filter.options, () => {}}
      invalidate={() => filter.invalidate()}
    />
  </div>
</div>
