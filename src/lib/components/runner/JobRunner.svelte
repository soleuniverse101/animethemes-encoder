<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Collapsible } from "bits-ui";
  import Progress from "../ui/Progress.svelte";

  interface Props {
    title: string;
    cancelled: boolean;
    cancel: () => void;
    /** Value between 0 and 1 */
    progress: number;
    stderr: string;
  }

  let { title, cancelled, cancel, progress, stderr }: Props = $props();
</script>

<div class="bg-primary-300 flex flex-col gap-2 p-2">
  <div class="flex justify-between items-center pl-2">
    <p>{title}</p>
    <div class="flex gap-2">
      <button
        disabled={cancelled}
        onclick={cancel}
        title="Cancel job"
        class="bg-primary-200 p-2 disabled:opacity-40 disabled:cursor-not-allowed"
        ><Icon icon="mdi:remove" /></button
      >
    </div>
  </div>
  <Progress class="bg-primary-200" label="Computing frames..." value={progress} />
  {let open = $state(false)}
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="mb-1 flex px-2 items-center gap-1"
      >{#if open}
        <Icon icon="mdi:triangle" class="inline translate-y-px rotate-180 text-xs" /> Hide logs
      {:else}
        <Icon icon="mdi:triangle" class="inline translate-y-px rotate-90 text-xs" /> Show logs
      {/if}
    </Collapsible.Trigger>
    <!-- TODO componentize into a code/commands block viewer -->
    <Collapsible.Content class="max-h-52 overflow-auto bg-primary-200 py-2 px-3">
      <pre class="font-mono select-text">{stderr}</pre>
    </Collapsible.Content>
  </Collapsible.Root>
</div>
