import type { TimePosition } from "$lib/mpv/types";
import { createContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";

export type Bounds = { title: string; a?: TimePosition; b?: TimePosition };
const createBounds = (title: string, a?: TimePosition, b?: TimePosition): Bounds => ({
  title,
  a,
  b
});

export type Job = {
  file?: string;
  bounds: SvelteMap<string, Bounds>;
};

export function createBlankJob(): Job {
  let op = $state(createBounds("OP"));
  let ed = $state(createBounds("ED"));
  return {
    bounds: new SvelteMap([
      ["OP", op],
      ["ED", ed]
    ])
  };
}

export const [getJob, setJob] = createContext<Job>();
