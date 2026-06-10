<script lang="ts">
  import { Filters } from "$lib/app/encoding/filter.svelte";
  import { Separator } from "bits-ui";
  import EncodingTab, { type TabProps } from "../EncodingTab.svelte";
  import Filter from "./Filter.svelte";

  const {}: TabProps = $props();
</script>

<EncodingTab class="flex">
  <div class="w-1/2">
    <h4 class="text-center mb-2">Audio</h4>
    <div class="flex flex-col gap-4">
      {#each Filters.ids.audio as filter}
        <Filter id={filter} />
      {/each}
    </div>
  </div>
  <Separator.Root orientation="vertical" />
  <div class="w-1/2">
    <h4 class="text-center mb-2">Video</h4>
    <div class="flex flex-col gap-4">
      {#each Filters.ids.video as filter}
        <Filter id={filter} />
      {/each}
    </div>
  </div>
</EncodingTab>
