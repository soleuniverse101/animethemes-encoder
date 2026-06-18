<script lang="ts">
  import type { FileInfo, StreamInfo as StreamInfoType } from "$lib/app/encoding/source/info";
  import { assertNonNull } from "$lib/utils/assert";
  import { audioInfo, generalInfo, subtitleInfo, videoInfo } from "./infoSections";
  import InfoTable from "./InfoTable.svelte";

  interface Props {
    info: FileInfo;
    class?: string;
  }

  const { info, class: _class }: Props = $props();
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

<div class={_class}>
  <InfoTable
    sections={[
      generalInfo(info),
      ...streams.map((info) => {
        const index =
          streamsByType[info.codec_type]?.length == 1 ? null : assertNonNull(streamIndex.get(info));
        switch (info.codec_type) {
          case "video":
            return videoInfo(info, index);
          case "audio":
            return audioInfo(info, index);
          case "subtitle":
            return subtitleInfo(info, index);
        }
      })
    ]}
  />
</div>
