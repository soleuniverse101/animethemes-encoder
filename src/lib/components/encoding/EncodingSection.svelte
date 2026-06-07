<script lang="ts">
  import { Tabs } from "bits-ui";
  import ExportTab from "./ExportTab.svelte";
  import FiltersTab from "./FiltersTab.svelte";

  const tabs = [
    ["filters", "Filters", FiltersTab],
    ["export", "Export", ExportTab]
  ] as const;

  type TabId = (typeof tabs)[number][0];
  let currentTab: TabId = $state("filters");
</script>

<div class="flex flex-col items-center">
  <h2>Encoding settings</h2>
  <Tabs.Root bind:value={currentTab} class="mt-2 w-full">
    <Tabs.List>
      {#each tabs as [id, name]}
        <Tabs.Trigger value={id}><h3>{name}</h3></Tabs.Trigger>
      {/each}
    </Tabs.List>
    {#each tabs as [id, _, Tab]}
      <Tabs.Content value={id} class="pt-1"><Tab /></Tabs.Content>
    {/each}
  </Tabs.Root>
</div>
