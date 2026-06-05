<script lang="ts">
  import type { CompilerContext } from "$lib/app/encoding/compilers";
  import { firstPass, secondPass } from "$lib/app/encoding/compilers/export";
  import { getApp } from "$lib/app/index.svelte";
  import { assertNonNull } from "$lib/utils/assert";
  import Icon from "@iconify/svelte";
  import { writeText } from "@tauri-apps/plugin-clipboard-manager";
  import Checkbox from "../ui/Checkbox.svelte";
  import ProgressButton from "../ui/ProgressButton.svelte";

  const app = getApp();
  function exportCommands(context: CompilerContext) {
    return [firstPass(assertNonNull(context)), secondPass(assertNonNull(context))].map((cmd) =>
      cmd.compile()
    );
  }
</script>

<div class="p-2 bg-primary-300 gap-2">
  {#if app.file}
    <!-- TODO should be derived ? -->
    {const context: CompilerContext = $derived({
      profile: app.config.profile,
      file: app.file,
      job: app.currentJob
    })}
    {#if app.currentJob.filters.audio.normalization.value != null}
      <div class="flex flex-col">
        <!-- TODO Replace by {const} once prettier-plugin-svelte handles declaration tags -->
        {const cmds = exportCommands(context)}
        {let wrap = $state(false)}
        <div class="flex justify-between items-center">
          <Checkbox bind:checked={wrap} text="Wrap lines" />
          <button onclick={() => writeText(cmds.join("\n"))} class="bg-primary-200 p-2"
            ><Icon icon="mdi:content-copy" /></button
          >
        </div>
        <div class="overflow-x-auto bg-primary-200 py-2 px-3">
          {#each cmds as cmd}
            <!-- TODO add wrapping bound to checkbox -->
            <pre
              class="font-mono select-text not-first:mt-3 wrap-break-word"
              class:whitespace-normal={wrap}>{cmd}</pre>
          {/each}
        </div>
      </div>
    {:else}
      {let loading = $state(false)}
      <ProgressButton
        {loading}
        onclick={() => {
          loading = true;
          app.currentJob.filters.audio.normalization.compute(context);
        }}>Compute loudness normalization</ProgressButton
      >
    {/if}
  {:else}
    <p>Cannot export command if no file is selected.</p>
  {/if}
</div>
