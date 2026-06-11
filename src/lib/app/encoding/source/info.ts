import z from "zod";
import { CommandBuilder } from "../command-builder";
import type { CompilerContext } from "../compilers";

const ffprobeSchema = z.object({
  streams: z.array(
    z.union([
      z.object({
        index: z.int(),
        codec_name: z.string(),
        codec_long_name: z.string(),
        // TODO manage attachments
        codec_type: z.literal(["audio", "video", "subtitle"])
      }),
      // z.object({ codec_type: z.literal("attachment") }),
      z.object({}).pipe(z.transform(() => null))
    ])
  )
});

type FileInfo = z.infer<typeof ffprobeSchema>;
export type StreamInfo = FileInfo["streams"][number];

export async function parseInfo(context: CompilerContext): Promise<FileInfo> {
  const cmd = new CommandBuilder("ffprobe");

  cmd.setFlag("show_streams");

  cmd.setOption("output_format", "json");
  cmd.addPositional(context.file);
  console.log(cmd.compile());
  const result = JSON.parse((await cmd.build().execute()).stdout);
  console.log(result);
  return ffprobeSchema.parse(result);
}
