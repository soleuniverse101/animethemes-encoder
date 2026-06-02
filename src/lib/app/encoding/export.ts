import { Format } from "$lib/utils/format";
import { CommandBuilder } from "$lib/utils/shell";
import type { Job } from "./job.svelte";

export function compileCommand(file: string, job: Job): string {
  const cmd = new CommandBuilder("ffmpeg");

  // TODO change once precise timecode mappings available through ffprobe
  cmd.setArgument("ss", Format.toTimecode(job.bounds.start));
  cmd.setArgument("to", Format.toTimecode(job.bounds.end));

  // TODO more standard way to normalize path
  cmd.setArgument("i", `"${file.replaceAll("\\", "\\\\")}"`);

  return cmd.compile();
}
