import { joinFilter } from "$lib/utils/filters";
import { Format } from "$lib/utils/format";
import z from "zod";
import { schemaInfo } from "..";
import { createDescription } from "../../filter.svelte";

const curveType = z.literal([
  "tri",
  "qsin",
  "hsin",
  "esin",
  "log",
  "ipar",
  "qua",
  "cub",
  "squ",
  "cbr",
  "par",
  "exp",
  "iqsin",
  "ihsin",
  "dese",
  "desi",
  "losi"
]);

export const fadeInSchema = z.object({
  duration: z.int().register(schemaInfo, { title: "Duration (ms)" }),
  curve: curveType.register(schemaInfo, { title: "Transition curve" })
});

export const fadeIn = createDescription<"audio.fadeIn">({
  pass: 2,
  compute: (
    {
      job: {
        bounds: { start }
      }
    },
    { duration, curve }
  ) =>
    joinFilter("afade", {
      t: "in",
      st: Format.toTimecode(start),
      d: Format.toSeconds(duration),
      curve
    }),
  defaultOptions: () => ({ duration: 500, curve: "exp" }),
  description: "Fade at the start"
});

export const fadeOutSchema = z.object({
  duration: z.int().register(schemaInfo, { title: "Duration (ms)" }),
  curve: curveType.register(schemaInfo, { title: "Transition curve" })
});

export const fadeOut = createDescription<"audio.fadeOut">({
  pass: 2,
  compute: (
    {
      job: {
        bounds: { end }
      }
    },
    { duration, curve }
  ) =>
    joinFilter("afade", {
      t: "out",
      st: Format.toTimecode(end - duration / 1000),
      d: Format.toSeconds(duration),
      curve
    }),
  defaultOptions: () => ({ duration: 500, curve: "exp" }),
  description: "Fade at the end"
});
