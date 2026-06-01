<script lang="ts">
  import { compileCommand } from "$lib/app/encoding/export";
  import { getApp } from "$lib/app/index.svelte";
  import Icon from "@iconify/svelte";
  import { writeText } from "@tauri-apps/plugin-clipboard-manager";

  const app = getApp();

  const cmd = $derived(app.file ? compileCommand(app.file, app.currentJob) : null);
</script>

<div class="p-2 bg-primary-300 relative">
  {#if cmd}
    <button onclick={async () => writeText(cmd)} class="bg-primary-200 block p-2 ml-auto"
      ><Icon icon="mdi:content-copy" /></button
    >
    <p class="font-mono select-text overflow-x-scroll py-2">{cmd}</p>
  {:else}
    <p>Cannot export command if no file is selected.</p>
  {/if}
</div>
