<script lang="ts">
  import { compileCommand, loudnormCommand } from "$lib/app/encoding/export";
  import { toFiltersList } from "$lib/app/encoding/loudnorm";
  import { getApp } from "$lib/app/index.svelte";
  import { assertNonNull } from "$lib/utils/assert";
  import Icon from "@iconify/svelte";
  import { writeText } from "@tauri-apps/plugin-clipboard-manager";
  import { Command } from "@tauri-apps/plugin-shell";
  import { Button } from "bits-ui";

  const app = getApp();

  async function computeLoudness() {
    const cmd = loudnormCommand(assertNonNull(app.file), app.currentJob);
    app.currentJob.normalizationFilters = toFiltersList(
      JSON.parse((await Command.create(cmd.program, cmd.getArgs()).execute()).stdout)
    );
  }
</script>

<div class="p-2 bg-primary-300 relative">
  {#if app.file}
    {#if app.currentJob.normalizationFilters != null}
      {@const cmd = compileCommand(app.file, app.currentJob).compile()}
      <button onclick={() => writeText(cmd)} class="bg-primary-200 block p-2 mb-2 ml-auto"
        ><Icon icon="mdi:content-copy" /></button
      >
      <p class="font-mono select-text overflow-x-auto py-2 px-3 bg-primary-200">{cmd}</p>
    {:else}
      <Button.Root onclick={computeLoudness}>Compute loudness normalization</Button.Root>
    {/if}
  {:else}
    <p>Cannot export command if no file is selected.</p>
  {/if}
</div>
