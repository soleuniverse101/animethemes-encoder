<script lang="ts">
  import type { FileInfo, StreamInfo as StreamInfoType } from "$lib/app/encoding/source/info";
  import { assertNonNull } from "$lib/utils/assert";
  import GeneralInfo from "./streams/GeneralInfo.svelte";
  import StreamInfo from "./streams/StreamInfo.svelte";

  interface Props {
    info: FileInfo;
  }

  const { info }: Props = $props();
  const streams = $derived(info.streams.filter((stream) => stream != null));

  const streamIndex = new Map<StreamInfoType, number>();
  // TODO temporary (later blindly print unparsed streams)
  const streamsByType = $derived.by(() => {
    const streamsGroups = Object.groupBy(streams, ({ codec_type }) => codec_type);
    Object.values(streamsGroups).forEach((streams) =>
      streams.forEach((stream, index) => streamIndex.set(stream, index))
    );
    return streamsGroups;
  });
</script>

<GeneralInfo {info} />
{#each streams as info}
  <StreamInfo
    {info}
    index={streamsByType[info.codec_type]?.length == 1
      ? null
      : assertNonNull(streamIndex.get(info))}
  />
{/each}
