import * as z from "zod/mini";

const LoudnessStats = z.object({
  input_i: z.string(),
  input_tp: z.string(),
  input_lra: z.string(),
  input_thresh: z.string(),
  target_offset: z.string()
});

const base = "loudnorm=I=-16:LRA=20:TP=-1:dual_mono=true:linear=true";

export function toFiltersList(stats: object): string {
  const { input_i, input_lra, input_tp, input_thresh, target_offset } = LoudnessStats.parse(stats);
  return `${base}:${[
    ["measured_I", input_i],
    ["measured_LRA", input_lra],
    ["measured_TP", input_tp],
    ["measured_thresh", input_thresh],
    ["offset", target_offset]
  ]
    .map(([stat, value]) => `${stat}=${value}`)
    .join(":")}`;
}
