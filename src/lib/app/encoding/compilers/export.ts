import { assertNonNull } from "$lib/utils/assert";
import type { CompilerContext } from ".";
import { base } from "./base";

export function exportBase(context: CompilerContext) {
  const cmd = base(context);
  const { profile } = context;

  // Video
  cmd.setOption("c:v", profile.video.codec); // codec

  // Bitrate control (choose one)
  const { bitrate } = profile.video;
  if (bitrate.type == "average") {
  }
  //   1. Average bitrate
  // TODO + bufsize
  //   2. Perceptual quality
  else {
    cmd.setOption("crf", bitrate.crf); // CRF = Constant Rate Factor (lower = better quality but larger file)
    cmd.setOption("b:v", 0);
    cmd.setOption("qcomp", 0.7);
  }

  // Colorspace
  // TODO verify and correlate with source
  cmd.setOption("pix_fmt", "yuv420p");
  cmd.setOption("colorspace", "bt709");
  cmd.setOption("color_primaries", "bt709");
  cmd.setOption("color_trc", "bt709");

  // TODO video filters

  // Processing, multithreading & parallelization
  cmd.setOption("g", "240"); // maximum keyframe interval (= distance between full keyframes)
  cmd.setOption("threads", "4"); // TODO detect # of cores
  cmd.setOption("tile-columns", "6");
  cmd.setOption("frame-parallel", "0");
  cmd.setOption("auto-alt-ref", "1");
  cmd.setOption("lag-in-frames", "25");
  cmd.setOption("row-mt", "1"); // row multi-threading

  cmd.setFlag("y"); // overwrite result

  return cmd;
}

export function firstPass(context: CompilerContext) {
  const cmd = exportBase(context);

  cmd.setOption("pass", "1");

  // Processing, multithreading & parallelization
  cmd.setOption("cpu-used", "4"); // 0-5

  // Ignore other streams
  cmd.setFlag("an"); // disable audio
  cmd.setFlag("sn"); // disable subtitles

  // Output
  cmd.addOutput(["webm", "null"]);

  return cmd;
}

export function secondPass(context: CompilerContext) {
  const cmd = exportBase(context);
  const {
    profile: { audio },
    job
  } = context;

  cmd.setOption("pass", "2");

  // Audio
  cmd.setOption("c:a", audio.codec); // codec
  cmd.setOption("b:a", audio.bitrate);
  cmd.setOption("af", assertNonNull(job.normalizationFilters)); // TODO audio filters (fade)

  // Processing, multithreading & parallelization
  cmd.setOption("cpu-used", "0"); // 0-5

  // Erase metadata & chapters (only useful for the actual output)
  cmd.setOption("map_metadata", "-1");
  cmd.setOption("map_chapters", "-1");

  // Output
  cmd.addOutput(["webm", job.label + ".webm"]); // TODO name

  return cmd;
}
