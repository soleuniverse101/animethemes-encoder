<script lang="ts">
  import { Tabs } from "bits-ui";
  import ExportTab from "./ExportTab.svelte";

  const tabs = [["export", "Export", ExportTab]] as const;
</script>

<div class="flex flex-col items-center">
  <h2>Encoding settings</h2>
  <Tabs.Root value={tabs[0][0]} class="w-full mt-2">
    <Tabs.List>
      {#each tabs as [id, name]}
        <Tabs.Trigger value={id}>{name}</Tabs.Trigger>
      {/each}
    </Tabs.List>
    {#each tabs as [id, _, Tab]}
      <Tabs.Content value={id} class="pt-1"><Tab /></Tabs.Content>
    {/each}
  </Tabs.Root>
</div>
