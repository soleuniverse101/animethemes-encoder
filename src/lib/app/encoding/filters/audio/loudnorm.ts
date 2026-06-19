import { emptyOptionsSchema } from "$lib/utils/zod";
import z from "zod";
import { createFilterJoiner } from "..";
import type { CompilerContext } from "../../compilers";
import { base } from "../../compilers/base";
import { createDescription } from "../../filter.svelte";

const joinFilter = createFilterJoiner("loudnorm", {
  I: -16,
  LRA: 20,
  TP: -1,
  dual_mono: true,
  linear: true
});

const LoudnessStats = z.object({
  input_i: z.string(),
  input_tp: z.string(),
  input_lra: z.string(),
  input_thresh: z.string(),
  target_offset: z.string()
});

function normalizationPass(context: CompilerContext) {
  return base(context)
    .setOption("af", joinFilter({ print_format: "json", stats_file: "-" }))
    .addOutput(null, null);
}

function toFiltersList(stats: object): string {
  const { input_i, input_lra, input_tp, input_thresh, target_offset } = LoudnessStats.parse(stats);
  return joinFilter({
    measured_I: input_i,
    measured_LRA: input_lra,
    measured_TP: input_tp,
    measured_thresh: input_thresh,
    offset: target_offset
  });
}

export const loudnormSchema = emptyOptionsSchema();

export const loudnorm = createDescription<"audio.loudnorm">({
  pass: 2,
  compute: async (context) =>
    toFiltersList(JSON.parse((await normalizationPass(context).build().execute()).stdout)),
  description: "Loudness normalization (loudnorm)"
});
