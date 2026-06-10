import { emptyOptionsSchema } from "$lib/utils/zod";
import { createDescription } from "../../filter.svelte";

export const unsharpSchema = emptyOptionsSchema();

export const unsharp = createDescription<"video.unsharp">({
  compute: () => "unsharp",
  description: "Sharpens or blurs the input video (unsharp)"
});
