import { intString } from "$lib/utils/zod";
import z from "zod";
import type z4 from "zod/v4/core";

const base = z.object({
  index: z.int(),
  codec_name: z.string(),
  codec_long_name: z.string()
});

type StreamType = "video" | "audio" | "subtitle" | "unknown";
const stream = <T extends StreamType, S extends z4.$ZodLooseShape>(type: T, shape: S) =>
  z.object(shape).transform((stream) => ({ type, stream }));

// Codec names from https://ffmpeg.org/ffmpeg-codecs.html
export const Stream = z.union([
  z.union([
    stream("unknown", {
      // TODO should contain images but not sure, check https://ffmpeg.org/ffmpeg-codecs.html
      codec_type: z.literal("video"),
      codec_name: z.literal("mjpeg")
    }),
    stream("video", {
      ...base.shape,
      codec_type: z.literal("video"),
      codec_name: z.string(),
      r_frame_rate: z.templateLiteral([z.int(), "/", z.int()]),
      // TODO check coded_width & coded_height
      width: z.int(),
      height: z.int(),
      display_aspect_ratio: z.string(),
      // Colorspace
      // TODO replace with possible values ?
      color_primaries: z.string(),
      color_range: z.string(),
      color_space: z.string(),
      color_transfer: z.string()
    }),
    stream("audio", {
      ...base.shape,
      codec_type: z.literal("audio"),
      bit_rate: intString.optional(),
      tags: z.object({ language: z.string() }).partial()
    }),
    stream("subtitle", {
      ...base.shape,
      codec_type: z.literal("subtitle"),
      tags: z.object({ language: z.string() }).partial()
    }),
    stream("unknown", {
      // TODO manage attachments
      codec_type: z.literal("attachment")
    }),
    // TODO other streams
    stream("unknown", {
      // https://ffmpeg.org/doxygen/trunk/group__lavu__misc.html#ga9a84bba4713dfced21a1a56163be1f48
      codec_type: z.literal(["unknown", "data", "nb"])
    })
  ])
]);
