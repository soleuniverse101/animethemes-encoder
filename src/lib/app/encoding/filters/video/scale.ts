import { joinFilter } from "$lib/utils/filters";
import z from "zod";
import { schemaInfo } from "..";
import { createDescription } from "../../filter.svelte";

export const scaleSchema = z.object({
  scale: z.literal("-1:720").register(schemaInfo, { title: "Scale" })
});

export const scale = createDescription<"video.scale">({
  compute: (_, { scale }) => joinFilter("scale", scale),
  defaultOptions: () => ({ scale: "-1:720" }),
  description: "Resize the input video (scale)"
});
