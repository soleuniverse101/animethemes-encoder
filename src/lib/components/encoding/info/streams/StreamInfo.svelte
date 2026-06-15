<script lang="ts">
  import type { StreamInfo } from "$lib/app/encoding/source/info";
  import { assertNonNull } from "$lib/utils/assert";
  import { fromBytes } from "@shie1/bytes";
  import InfoTable, { streamDefault } from "./InfoTable.svelte";

  interface Props {
    info: StreamInfo;
    index: number | null;
  }

  const { info, index }: Props = $props();

  const languageDisplay = new Intl.DisplayNames(["en"], { type: "language" });
</script>

{#if info.codec_type == "video"}
  <InfoTable
    info={streamDefault(info, index, [
      ["Resolution", `${info.width}x${info.height}`],
      {
        title: "Colorspace",
        entries: [
          ["Color range", info.color_range],
          ["Color primaries", info.color_primaries],
          ["Transfer characteristics", info.color_transfer],
          ["Matrix coefficients", info.color_space]
        ]
      }
    ])}
  />
{:else}
  {const languageEntry =
    info.tags.language &&
    (["Language", assertNonNull(languageDisplay.of(info.tags.language))] as const)}
  {#if info.codec_type == "audio"}
    <InfoTable
      info={streamDefault(info, index, [
        ["Bit rate", `${fromBytes(info.bit_rate).kiloBytes} kb/s`],
        languageEntry
      ])}
    />
  {:else}
    <InfoTable info={streamDefault(info, index, [languageEntry])} />
  {/if}
{/if}
