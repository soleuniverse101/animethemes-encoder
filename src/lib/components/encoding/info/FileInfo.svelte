<script lang="ts">
  import type { FileInfo, RawStream } from "$lib/app/encoding/source/info";
  import { assertNonNull } from "$lib/utils/assert";
  import { generalInfo, streamInfo } from "./infoSections";
  import InfoTable from "./InfoTable.svelte";

  interface Props {
    info: FileInfo;
    class?: string;
  }

  const { info, class: _class }: Props = $props();
  const { streams: rawStreams } = $derived(info);

  const streamIndex = new Map<RawStream, number>();
  const streamsByType = $derived.by(() => {
    const streamsGroups = Object.groupBy(rawStreams, ({ type }) => type);
    Object.values(streamsGroups).forEach((streams) =>
      streams.forEach((rawStream, index) => streamIndex.set(rawStream, index))
    );
    return streamsGroups;
  });
</script>

<div class={_class}>
  <InfoTable
    sections={[
      generalInfo(info),
      ...rawStreams
        .map((rawStream) =>
          streamInfo(
            rawStream,
            streamsByType[rawStream.type]?.length == 1
              ? null
              : assertNonNull(streamIndex.get(rawStream))
          )
        )
        .filter((info) => info != null)
    ]}
  />
</div>
