import type { TimePosition } from "$lib/mpv/types";
import { createContext } from "svelte";

export type Bounds = { title: string; a?: TimePosition; b?: TimePosition };
const createBounds = (title: string, a?: TimePosition, b?: TimePosition): Bounds => ({
  title,
  a,
  b
});

export type Job = {
  file?: string;
  bounds: Bounds[];
};

export function createBlankJob(): Job {
  return {
    bounds: [createBounds("OP"), createBounds("ED")]
  };
}

export const [getJob, setJob] = createContext<Job>();
