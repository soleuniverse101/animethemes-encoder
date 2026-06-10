import { emptyOptionsSchema } from "$lib/utils/zod";
import { createDescription } from "../../filter.svelte";

export const yadifSchema = emptyOptionsSchema();

export const yadif = createDescription<"video.yadif">({
  compute: () => "yadif",
  description: "Deinterlace the input video (yadif)"
});
