import { intString } from "$lib/utils/zod";
import z from "zod";

const base = z.object({
  index: z.int(),
  codec_name: z.string(),
  codec_long_name: z.string()
});

export const stream = z.union([
  z.discriminatedUnion("codec_type", [
    z.object({
      ...base.shape,
      codec_type: z.literal("video"),
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
    z.object({
      ...base.shape,
      codec_type: z.literal("audio"),
      bit_rate: intString.optional(),
      tags: z.object({ language: z.string() }).partial()
    }),
    z.object({
      ...base.shape,
      codec_type: z.literal("subtitle"),
      tags: z.object({ language: z.string() }).partial()
    })
  ]),
  // TODO manage attachments
  // z.object({ codec_type: z.literal("attachment") }),
  z.object({}).transform(() => null)
]);
