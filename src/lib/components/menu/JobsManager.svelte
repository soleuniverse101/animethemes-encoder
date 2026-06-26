<script lang="ts">
  import { getApp } from "$lib/app/index.svelte";
  import { assertNonNull } from "$lib/utils/assert";
  import Icon from "@iconify/svelte";
  import { RadioGroup } from "bits-ui";
  import Dialog from "../ui/Dialog.svelte";
  import Timecode from "../ui/Timecode.svelte";

  interface Props {
    open: boolean;
  }

  let { open = $bindable() }: Props = $props();

  const app = getApp();
  const { jobs } = $derived(app);
</script>

<!-- TODO clean up component (snippetify whatever possible) -->

<Dialog bind:open title="Manage jobs">
  <RadioGroup.Root
    bind:value={
      () => app.currentJob.label, (label) => (app.currentJob = assertNonNull(jobs.map.get(label)))
    }
    // TODO replace by subgrid for input to manually set 1rem gap only for the subgrid ?
    class="grid px-4 grid-cols-[repeat(2,auto)_1rem_repeat(2,auto)] gap-y-1"
  >
    {#each jobs.list as job}
      <RadioGroup.Item value={job.label} class="pl-1 pr-2">
        {#snippet children({ checked })}
          <Icon class="translate-y-px" icon={checked ? "mdi:square" : "mdi:square-outline"} />
        {/snippet}
      </RadioGroup.Item>
      <div class="bg-primary-200 pl-1 flex">
        {let currentLabel = $derived(job.label)}
        {let renaming = $derived(currentLabel != job.label)}
        {let labelValid = $derived(jobs.isValidNewLabel(currentLabel))}
        {const rename = () => jobs.renameJob(job.label, currentLabel)}
        <input
          type="text"
          bind:value={currentLabel}
          class="w-full"
          onkeyup={({ code }) => {
            if (code == "Enter" && renaming && labelValid) {
              rename();
            }
          }}
        />
        {#if renaming}
          <button
            onclick={rename}
            disabled={!labelValid}
            title={labelValid ? `Rename job to ${currentLabel}` : `Invalid job label`}
            class="aspect-square cursor-auto disabled:opacity-40"
          >
            <Icon icon="mdi:check" class="mx-auto" />
          </button>
        {/if}
      </div>
      <div class="text-sm flex items-center gap-0.5 col-start-4">
        <Timecode time={job.bounds.start} class="select-text" />
        <Icon icon="mdi:minus" />
        <Timecode time={job.bounds.end} class="select-text" />
      </div>
      <!-- TODO add confirmation dialog ? -->
      <button
        onclick={() => {
          const index = jobs.indexOf(job.label);
          app.currentJob = jobs.list[index == jobs.count - 1 ? jobs.count - 2 : index + 1];
          jobs.removeJob(job.label);
        }}
        disabled={jobs.single}
        title={`Remove ${job.label}`}
        class="cursor-auto disabled:opacity-40 aspect-square ml-1"
      >
        <Icon class="text-xl mx-auto" icon="mdi:remove" />
      </button>
    {/each}

    {let adding = $state(false)}
    {let label = $state("")}
    {let validLabel = $derived(jobs.isValidNewLabel(label))}
    {let start = $state(0)}
    {let end = $state(Number.POSITIVE_INFINITY)}
    {const addJob = () => {
      jobs.addJob({ label, start, end });
      adding = false;
      // Reset inputs
      label = "";
      start = 0;
      end = Number.POSITIVE_INFINITY;
    }}
    {#if adding}
      <input
        type="text"
        bind:value={label}
        onkeyup={({ code }) => {
          if (code == "Enter" && validLabel) {
            addJob();
          }
        }}
        class="col-start-2 w-full"
      />
      <div class="text-sm flex items-center gap-0.5 col-start-4">
        <Timecode time={start} class="select-text" />
        <Icon icon="mdi:minus" />
        <Timecode time={end} class="select-text" />
      </div>
      <button
        onclick={addJob}
        disabled={!validLabel}
        title={validLabel ? `Create job ${label}` : "Invalid job label"}
        class="cursor-auto disabled:opacity-40 aspect-square ml-1"
      >
        <Icon class="text-xl mx-auto" icon="mdi:check" />
      </button>
    {:else}
      <button onclick={() => (adding = true)} class="bg-primary-400 cursor-auto col-span-full"
        >+ New Job</button
      >
    {/if}
  </RadioGroup.Root>
</Dialog>
