<script>
  import { optionalFiltersIds } from "$lib/app/encoding/job.svelte";
  import { Separator } from "bits-ui";
  import EncodingTab from "./EncodingTab.svelte";
  import Filter from "./Filter.svelte";
</script>

<EncodingTab class="flex">
  <div class="w-1/2">
    <h4 class="text-center mb-2">Audio</h4>
    <div class="flex flex-col gap-4">
      <!-- TODO should required filters be printed ? probably -->
      {#each optionalFiltersIds.audio as filter}
        <Filter id={filter} />
      {/each}
    </div>
  </div>
  <Separator.Root orientation="vertical" />
  <div class="w-1/2">
    <h4 class="text-center mb-2">Video</h4>
    <div class="flex flex-col gap-4">
      <!-- TODO should required filters be printed ? probably -->
      {#each optionalFiltersIds.video as filter}
        <Filter id={filter} />
      {/each}
    </div>
  </div>
</EncodingTab>
