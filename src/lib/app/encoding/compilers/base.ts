import { Format } from "$lib/utils/format";
import type { CompilerContext } from ".";
import { CommandBuilder } from "../command-builder";

export function base({ file, job }: CompilerContext) {
  const base = new CommandBuilder("ffmpeg");

  base.setFlag("nostdin");
  
  // TODO change once precise timecode mappings available through ffprobe
  base
    .setOption("ss", Format.toTimecode(job.bounds.start))
    .setOption("to", Format.toTimecode(job.bounds.end));

  base.setOption("i", file);

  return base;
}
