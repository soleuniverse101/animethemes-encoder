<script lang="ts">
  import { parseInfo } from "$lib/app/encoding/source/info";
  import { getApp } from "$lib/app/index.svelte";
  import SpinningIcon from "$lib/components/ui/SpinningIcon.svelte";
  import EncodingTab from "../EncodingTab.svelte";
  import StreamInfo from "./StreamInfo.svelte";

  const app = getApp();
</script>

<EncodingTab>
  {#if app.file}
    <!-- TODO generalize context ? -->
    {#await parseInfo({ profile: app.config.profile, file: app.file, job: app.currentJob })}
      <p class="flex items-center gap-2"><SpinningIcon /> Parsing file info</p>
    {:then info}
      <h4 class="text-center">Streams</h4>
      {#each info.streams as stream}
        <StreamInfo info={stream} />
      {/each}
    {/await}
  {:else}
    <p>Import a video file to show info.</p>
  {/if}
</EncodingTab>
