<script lang="ts">
  import type { FileInfo } from "$lib/app/encoding/source/info";
  import { findFramerate, formatFramerate } from "$lib/app/encoding/source/utils";
  import { fromBytes } from "@shie1/bytes";
  import InfoTable from "./InfoTable.svelte";

  interface Props {
    info: FileInfo;
  }

  const { info }: Props = $props();
  const { format } = $derived(info);

  const framerate = $derived(formatFramerate(findFramerate(info.streams)));
</script>

<!-- TODO add file size format -->
<InfoTable
  info={{
    title: "General",
    entries: [
      ["File size", fromBytes(format.size).toString()],
      // TODO round necessary ?
      ["Overall bit rate", `${Math.round(fromBytes(format.bit_rate).kiloBytes)} kb/s`],
      ["Frame rate", framerate],
      format.tags.creation_time && ["Encoded date", format.tags.creation_time.toLocaleString()]
    ]
  }}
/>
