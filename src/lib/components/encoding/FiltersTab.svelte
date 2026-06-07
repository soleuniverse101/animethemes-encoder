<script>
  import { optionalFiltersIds } from "$lib/app/encoding/job.svelte";
  import EncodingTab from "./EncodingTab.svelte";
  import Filter from "./Filter.svelte";
</script>

<EncodingTab>
  <h4 class="text-center mb-2">Audio</h4>
  <div class="flex flex-col gap-4">
    <!-- TODO should required filters be printed ? probably -->
    {#each optionalFiltersIds.audio as filter}
      <Filter id={filter} />
    {/each}
  </div>
  <h4 class="text-center mb-2">Video</h4>
  <div class="flex flex-col gap-4">
    <!-- TODO should required filters be printed ? probably -->
    {#each optionalFiltersIds.video as filter}
      <Filter id={filter} />
    {/each}
  </div>
</EncodingTab>
