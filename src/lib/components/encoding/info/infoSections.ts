import type { FileInfo, StreamInfo } from "$lib/app/encoding/source/info";
import { findFramerate, formatFramerate } from "$lib/app/encoding/source/utils";
import { assertNonNull } from "$lib/utils/assert";
import { toSentenceCase } from "$lib/utils/string";
import { fromBytes } from "@shie1/bytes";
import type { Info } from "./InfoEntries.svelte";

export function generalInfo(info: FileInfo): Info {
  const { format } = info;

  return {
    title: "General",
    entries: [
      ["File size", fromBytes(format.size).toString()],
      // TODO round necessary ?
      ["Overall bit rate", `${Math.round(fromBytes(format.bit_rate).kiloBytes)} kb/s`],
      ["Frame rate", formatFramerate(findFramerate(info.streams))],
      format.tags.creation_time && ["Encoded date", format.tags.creation_time.toLocaleString()]
    ]
  };
}

/**
 * @param info
 * @param index Index of the stream relative to others of its type or null if it's the only one.
 * @param additionalEntries
 */
export function streamDefault(
  info: StreamInfo,
  index: number | null,
  additionalEntries: Info["entries"] = []
): Info {
  return {
    // TODO rename subtitle to text ?
    title: toSentenceCase(info.codec_type) + (index == null ? "" : ` #${index}`),
    entries: [
      // TODO hide ID ?
      ["ID", info.index.toString()],
      ["Codec (Format)", `${info.codec_long_name} (${info.codec_name})`],
      ...additionalEntries
    ]
  };
}

export const videoInfo = (info: StreamInfo.Video, index: number | null): Info =>
  streamDefault(info, index, [
    ["Resolution", `${info.width}x${info.height}`],
    ["Display aspect ratio", `${info.display_aspect_ratio}`],
    ["Frame rate", `${formatFramerate(info.r_frame_rate)}`],
    {
      title: "Colorspace",
      entries: [
        ["Color range", info.color_range],
        ["Color primaries", info.color_primaries],
        ["Transfer characteristics", info.color_transfer],
        ["Matrix coefficients", info.color_space]
      ]
    }
  ]);

const languageDisplay = new Intl.DisplayNames(["en"], { type: "language" });
const languageEntry = (info: StreamInfo.Audio | StreamInfo.Subtitle) =>
  info.tags.language &&
  (["Language", assertNonNull(languageDisplay.of(info.tags.language))] as const);

export const audioInfo = (info: StreamInfo.Audio, index: number | null): Info =>
  streamDefault(info, index, [
    info.bit_rate != null && ["Bit rate", `${fromBytes(info.bit_rate).kiloBytes} kb/s`],
    languageEntry(info)
  ]);

export const subtitleInfo = (info: StreamInfo.Subtitle, index: number | null): Info =>
  streamDefault(info, index, [languageEntry(info)]);
