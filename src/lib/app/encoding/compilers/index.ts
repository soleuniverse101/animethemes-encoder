import type { Job } from "../job.svelte";
import type { Profile } from "../profile";

// Default structure
// ffmpeg "[global options]" "[input options]" -i input "[output options]" output
// |__________________________________________________|
//                         base

export type CompilerContext = {
  profile: Profile;
  file: string;
  job: Job;
};
