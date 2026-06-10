<script lang="ts">
  import { Tabs } from "bits-ui";
  import ExportTab from "./ExportTab.svelte";
  import FiltersTab from "./filters/FiltersTab.svelte";
  import InfoTab from "./info/InfoTab.svelte";

  const tabs = $state({
    info: { title: "Info", component: InfoTab, loaded: false },
    filters: { title: "Filters", component: FiltersTab, loaded: false },
    export: { title: "Export", component: ExportTab, loaded: false }
  });

  const tabIds = Object.keys(tabs) as (keyof typeof tabs)[];

  type TabId = (typeof tabIds)[number];
  let currentTab: TabId = $state(tabIds[0]);

  $effect(() => {
    tabs[currentTab].loaded = true;
  });
</script>

<div class="flex flex-col items-center">
  <h2>Encoding settings</h2>
  <Tabs.Root bind:value={currentTab} class="mt-2 w-full">
    <Tabs.List>
      {#each tabIds as id}
        <Tabs.Trigger value={id}><h3>{tabs[id].title}</h3></Tabs.Trigger>
      {/each}
    </Tabs.List>
    {#each tabIds as id}
      {const Tab = tabs[id].component}
      <Tabs.Content value={id} class="pt-1"><Tab tabLoaded={tabs[id].loaded} /></Tabs.Content>
    {/each}
  </Tabs.Root>
</div>
