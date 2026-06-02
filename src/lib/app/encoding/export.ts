import { Format } from "$lib/utils/format";
import { CommandBuilder } from "$lib/utils/shell";
import type { Job } from "./job.svelte";

// Default structure
// ffmpeg "[global options]" "[input options]" -i input "[output options]" output
// |__________________________________________________|
//                         base

function baseCommand(file: string, job: Job) {
  const base = new CommandBuilder("ffmpeg");
  // TODO remove/make optional ?
  base.addArgument("nostdin");
  base.addArgument("hide_banner");
  base.addArgument("v", "quiet");

  // TODO change once precise timecode mappings available through ffprobe
  base
    .addArgument("ss", Format.toTimecode(job.bounds.start))
    .addArgument("to", Format.toTimecode(job.bounds.end));

  // TODO more standard way to normalize path
  base.addArgument("i", file);

  return base;
}

export function loudnormCommand(file: string, job: Job) {
  return baseCommand(file, job)
    .addArgument(
      "af",
      "loudnorm=I=-16:LRA=20:TP=-1:dual_mono=true:linear=true:print_format=json:stats_file=-"
    )
    .addOutput(null);
}

export function compileCommand(file: string, job: Job) {
  const cmd = baseCommand(file, job);

  // Erase metadata (global, video, audio)
  cmd.addArgument("map_metadata:g", "-1");
  cmd.addArgument("map_metadata:s:v", "-1");
  cmd.addArgument("map_metadata:s:a", "-1");

  // Erase chapters
  cmd.addArgument("map_chapters", "-1");

  return cmd;
}
