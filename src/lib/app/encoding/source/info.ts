import { intString } from "$lib/utils/zod";
import z from "zod";
import { CommandBuilder } from "../command-builder";
import type { CompilerContext } from "../compilers";
import { stream } from "./schemas";

const ffprobeSchema = z.object({
  format: z.object({
    bit_rate: intString,
    size: intString,
    tags: z
      .object({
        creation_time: z.iso.datetime().transform((date) => new Date(date))
      })
      .partial()
  }),
  streams: z.array(stream)
});

export type FileInfo = z.infer<typeof ffprobeSchema>;
export type FormatInfo = FileInfo["format"];
export type StreamInfo = NonNullable<FileInfo["streams"][number]>;
export namespace StreamInfo {
  export type Video = Extract<StreamInfo, { codec_type: "video" }>;
  export type Audio = Extract<StreamInfo, { codec_type: "audio" }>;
  export type Subtitle = Extract<StreamInfo, { codec_type: "subtitle" }>;
}

export async function parseInfo(context: CompilerContext): Promise<FileInfo> {
  const cmd = new CommandBuilder("ffprobe");

  cmd.setFlag("show_format");
  cmd.setFlag("show_streams");

  cmd.setOption("output_format", "json");
  cmd.addPositional(context.file);
  console.log(cmd.compile());
  const result = JSON.parse((await cmd.build().execute()).stdout);
  console.log(result);
  return ffprobeSchema.parse(result);
}
