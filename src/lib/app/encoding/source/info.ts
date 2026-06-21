import { intString } from "$lib/utils/zod";
import z from "zod";
import { CommandBuilder } from "../commands/builder";
import type { CompilerContext } from "../compilers";
import { Stream } from "./schemas";

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
  streams: z.array(Stream)
});

export type FileInfo = z.infer<typeof ffprobeSchema>;
export type RawStream = FileInfo["streams"][number];
export type StreamType = RawStream["type"];
export type RawStreamInfo<T extends StreamType> = T extends any
  ? Extract<RawStream, { type: T }>
  : never;
export type StreamInfo<T extends StreamType> = RawStreamInfo<T>["stream"];

export async function parseInfo(context: CompilerContext): Promise<FileInfo> {
  const cmd = new CommandBuilder("ffprobe");

  cmd.setFlag("show_format");
  cmd.setFlag("show_streams");

  cmd.setOption("output_format", "json");
  cmd.setPositional("input", context.file);

  return ffprobeSchema.parse(JSON.parse((await cmd.build().execute()).stdout));
}
