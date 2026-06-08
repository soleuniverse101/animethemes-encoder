import { joinFilter } from "..";
import { createDescription } from "../../filter.svelte";

export const hqdn3dSchema = null;

export const hqdn3d = createDescription<"video.hqdn3d">({
  compute: () => joinFilter("hqdn3d", "0:0:3:3"),
  description: "Reduce noise (hqdn3d)"
});
