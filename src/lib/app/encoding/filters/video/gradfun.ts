import { emptyOptionsSchema } from "$lib/utils/zod";
import { createDescription } from "../../filter.svelte";

export const gradfunSchema = emptyOptionsSchema();

export const gradfun = createDescription<"video.gradfun">({
  compute: () => "gradfun",
  description: "Fix banding artifacts (gradfun)"
});
