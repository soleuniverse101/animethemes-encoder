<script lang="ts">
  import type { CompilerContext } from "$lib/app/encoding/compilers";
  import { firstPass, secondPass } from "$lib/app/encoding/compilers/export";
  import { getApp } from "$lib/app/index.svelte";
  import Icon from "@iconify/svelte";
  import { writeText } from "@tauri-apps/plugin-clipboard-manager";
  import Checkbox from "../ui/Checkbox.svelte";
  import SpinningIcon from "../ui/SpinningIcon.svelte";
  import EncodingTab, { type TabProps } from "./EncodingTab.svelte";

  const { tabLoaded }: TabProps = $props();

  const app = getApp();

  async function exportCommands(context: CompilerContext) {
    return [await firstPass(context), await secondPass(context)].map((cmd) => cmd.compile());
  }
</script>

<EncodingTab>
  {#if tabLoaded && app.file && Number.isFinite(app.currentJob.bounds.end)}
    <!-- TODO check on all required, maybe inform on state if heavy pass filters are required (they may have to be included in the command instead) -->
    {#await exportCommands({ profile: app.config.profile, file: app.file, job: app.currentJob })}
      <p class="flex items-center gap-2"><SpinningIcon /> Computing export command</p>
    {:then cmds}
      <div class="flex flex-col">
        <!-- TODO make it persistent either through settings, or remembering session to session -->
        {let wrap = $state(true)}
        <div class="flex justify-between items-center">
          <Checkbox bind:checked={wrap} text="Wrap lines" />
          <button onclick={() => writeText(cmds.join("\n"))} class="bg-primary-200 p-2"
            ><Icon icon="mdi:content-copy" /></button
          >
        </div>
        <div class="overflow-x-auto bg-primary-200 py-2 px-3">
          {#each cmds as cmd}
            <pre
              class="font-mono select-text not-first:mt-3 wrap-break-word"
              class:whitespace-normal={wrap}>{cmd}</pre>
          {/each}
        </div>
      </div>
    {/await}
  {:else}
    <p>Cannot export command if no file is selected.</p>
  {/if}
</EncodingTab>
