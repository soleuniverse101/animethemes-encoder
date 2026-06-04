<script lang="ts">
  import type { CompilerContext } from "$lib/app/encoding/compilers";
  import { firstPass, secondPass } from "$lib/app/encoding/compilers/export";
  import { normalizationPass, toFiltersList } from "$lib/app/encoding/compilers/loudnorm";
  import { getApp } from "$lib/app/index.svelte";
  import { assertNonNull } from "$lib/utils/assert";
  import Icon from "@iconify/svelte";
  import { writeText } from "@tauri-apps/plugin-clipboard-manager";
  import { Button } from "bits-ui";
  import Checkbox from "../ui/Checkbox.svelte";

  const app = getApp();

  // TODO should be derived ?
  const context: CompilerContext | null = $derived(
    app.file
      ? {
          profile: app.config.profile,
          file: app.file,
          job: app.currentJob
        }
      : null
  );

  async function computeLoudness() {
    const cmd = await normalizationPass(assertNonNull(context)).build().execute();
    app.currentJob.normalizationFilters = toFiltersList(JSON.parse(cmd.stdout));
  }

  function exportCommands() {
    return [firstPass(assertNonNull(context)), secondPass(assertNonNull(context))].map((cmd) =>
      cmd.compile()
    );
  }
</script>

<div class="p-2 bg-primary-300 relative flex flex-col gap-2">
  {#if app.file}
    {#if app.currentJob.normalizationFilters != null}
      <!-- TODO Replace by {const} once prettier-plugin-svelte handles declaration tags -->
      {@const cmds = exportCommands()}
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
    {:else}
      <Button.Root onclick={computeLoudness}>Compute loudness normalization</Button.Root>
    {/if}
  {:else}
    <p>Cannot export command if no file is selected.</p>
  {/if}
</div>
