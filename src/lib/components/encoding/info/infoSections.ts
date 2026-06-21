import type {
  FileInfo,
  RawStreamInfo,
  StreamInfo,
  StreamType
} from "$lib/app/encoding/source/info";
import { findFramerate, formatFramerate } from "$lib/app/encoding/source/utils";
import { assertNonNull } from "$lib/utils/assert";
import { toSentenceCase } from "$lib/utils/string";
import { fromBytes } from "@shie1/bytes";
import type { Info } from "./InfoEntries.svelte";

export const generalInfo = ({ format, streams }: FileInfo): Info => ({
  title: "General",
  entries: [
    ["File size", fromBytes(format.size).toString()],
    // TODO round necessary ?
    ["Overall bit rate", `${Math.round(fromBytes(format.bit_rate).kiloBytes)} kb/s`],
    ["Frame rate", formatFramerate(findFramerate(streams))],
    format.tags.creation_time && ["Encoded date", format.tags.creation_time.toLocaleString()]
  ]
});

export function streamInfo<T extends StreamType>(
  rawStream: RawStreamInfo<T>,
  index: number | null
) {
  switch (rawStream.type) {
    case "video":
      return videoInfo(rawStream.stream, index);
    case "audio":
      return audioInfo(rawStream.stream, index);
    case "subtitle":
      return subtitleInfo(rawStream.stream, index);
    default:
      return null;
  }
}

/**
 * @param info
 * @param index Index of the stream relative to others of its type or null if it's the only one.
 * @param additionalEntries
 */
export function streamDefault(
  info: StreamInfo<"video" | "audio" | "subtitle">,
  index: number | null,
  additionalEntries: Info["entries"] = []
): Info {
  return {
    // TODO rename subtitle to text ?
    title: toSentenceCase(info.codec_type) + (index == null ? "" : ` #${index + 1}`),
    entries: [
      // TODO hide ID ?
      ["ID", info.index.toString()],
      ["Codec (Format)", `${info.codec_long_name} (${info.codec_name})`],
      ...additionalEntries
    ]
  };
}

export const videoInfo = (info: StreamInfo<"video">, index: number | null): Info =>
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
const languageEntry = (info: StreamInfo<"audio" | "subtitle">) =>
  info.tags.language &&
  (["Language", assertNonNull(languageDisplay.of(info.tags.language))] as const);

export const audioInfo = (info: StreamInfo<"audio">, index: number | null): Info =>
  streamDefault(info, index, [
    info.bit_rate != null && ["Bit rate", `${fromBytes(info.bit_rate).kiloBytes} kb/s`],
    languageEntry(info)
  ]);

export const subtitleInfo = (info: StreamInfo<"subtitle">, index: number | null): Info =>
  streamDefault(info, index, [languageEntry(info)]);
