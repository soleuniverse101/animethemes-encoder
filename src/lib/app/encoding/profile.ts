import z from "zod";

export const Profile = z.object({
  debug: z.object({}),
  video: z.object({
    codec: z.literal("libvpx-vp9"),
    bitrate: z.discriminatedUnion("type", [
      z.object({ type: z.literal("average") }),
      z.object({ type: z.literal("perceptual"), crf: z.int().min(0).max(63) })
    ]),
    colorspace: z.object({})
  }),
  audio: z.object({
    codec: z.literal("libopus"),
    bitrate: z.literal(["192k", "320k"]).default("192k")
  }),
  processing: z.object({}),
  metadata: z.object({}),
  output: z.object({})
});

export type Profile = z.infer<typeof Profile>;

export const defaultProfile = (): Profile => ({
  debug: {},
  video: {
    codec: "libvpx-vp9",
    bitrate: { type: "perceptual", crf: 18 },
    colorspace: {}
  },
  audio: {
    codec: "libopus",
    bitrate: "192k"
  },
  processing: {},
  metadata: {},
  output: {}
});
