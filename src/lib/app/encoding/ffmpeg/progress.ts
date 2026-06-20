import { intString } from "$lib/utils/zod";
import z from "zod";
import type z4 from "zod/v4/core";

const optionalValue = <T extends z4.$ZodType>(schema: T) =>
  z.union([z.literal("N/A").transform(() => null), schema]);

const Progress = z.object({
  frame: intString,
  // TODO report out_time_ms wrong value in FFmpeg issues
  out_time_us: optionalValue(intString),
  progress: z.literal(["continue", "end"])
});
type Progress = z.infer<typeof Progress>;

export class ProgressReader {
  private sequence: Record<string, string> = {};
  private onProgress: (progress: Progress) => void;

  constructor(onProgress: (progress: Progress) => void) {
    this.onProgress = onProgress;
  }

  line(line: string) {
    const [key, value] = line.trim().split("=");
    this.sequence[key] = value;
    if (key == "progress") {
      const progress = Progress.parse(this.sequence);
      this.sequence = {};
      this.onProgress(progress);
    }
  }
}
