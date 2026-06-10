import z from "zod";
import { CommandBuilder } from "../command-builder";
import type { CompilerContext } from "../compilers";

const ffprobeSchema = z.object({
  streams: z.array(
    z.object({
      index: z.int(),
      codec_name: z.literal(["vp9", "opus"]),
      codec_long_name: z.string(),
      codec_type: z.literal(["audio", "video"])
    })
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
