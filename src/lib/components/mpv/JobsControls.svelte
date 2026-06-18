<script lang="ts">
  import { getApp } from "$lib/app/index.svelte";
  import { assertNonNull } from "$lib/utils/assert";
  import Icon from "@iconify/svelte";
  import { DropdownMenu } from "bits-ui";
  import JobsManager from "../menu/JobsManager.svelte";
  import Select from "../ui/Select.svelte";

  const app = getApp();
  const { jobs } = $derived(app);

  let jobsManagerOpen = $state(false);
</script>

<Select
  type="single"
  items={jobs.list.map(({ label }) => ({ value: label, label }))}
  bind:value={
    () => app.currentJob.label, (label) => (app.currentJob = assertNonNull(jobs.map.get(label)))
  }
/>

<DropdownMenu.Root>
  <!-- TODO extract hover color and apply to playback buttons -->
  <DropdownMenu.Trigger class="h-8 w-8 rounded-full hover:bg-[rgb(230,225,240)]"
    ><Icon class="mx-auto" icon="mdi:dots-horizontal" /></DropdownMenu.Trigger
  >
  <DropdownMenu.Portal>
    <DropdownMenu.Content side="top" sideOffset={4}>
      <DropdownMenu.Item onSelect={() => (jobsManagerOpen = true)}>Manage jobs...</DropdownMenu.Item
      >
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>

<JobsManager bind:open={jobsManagerOpen} />
