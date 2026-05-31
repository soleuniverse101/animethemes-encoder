import type { Bounds } from "$lib/app/job.svelte";
import { assertNonNull } from "$lib/utils/assert";
import { FileUtils } from "$lib/utils/file";
import type { MPVWindowContext } from "./api";
import type { MPVListenerView } from "./listener";
import type { TimePosition } from "./types";

export namespace MPVControls {
  export type Command = Exclude<keyof MPVControls, "label" | "listenerView" | "context">;

  // thanks ChatGPT
  type IsAllOptional<T extends readonly any[]> = T extends []
    ? true
    : T extends [infer F, ...infer R]
      ? undefined extends F
        ? IsAllOptional<R>
        : false
      : never;

  // First comparing C to any triggers an iteration over all possible types,
  // without it the whole type (not each of its union members) is directly compared to []
  // reference : https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
  type _ParameterlessCommand<C extends Command = Command> = C extends any
    ? IsAllOptional<Parameters<MPVControls[C]>> extends true
      ? C
      : never
    : never;
  export type ParameterlessCommand = _ParameterlessCommand<Command>;
}

export class MPVControls {
  readonly label: string;
  readonly listenerView: MPVListenerView;
  readonly context: MPVWindowContext;

  constructor(label: string, listenerView: MPVListenerView, context: MPVWindowContext) {
    this.label = label;
    this.listenerView = listenerView;
    this.context = context;
  }

  async loadFile(path: string) {
    await this.context.command("loadfile", [path]);
  }

  async playPause() {
    await this.context.command("cycle", ["pause"]);
  }
  /** @param position Timecode in seconds. */
  async setPosition(position: TimePosition) {
    await this.context.command("seek", [position, "absolute"]);
  }

  async forwardSeek(duration = 5) {
    await this.context.command("seek", [duration, "exact"]);
  }
  async backwardSeek(duration = 5) {
    await this.context.command("seek", [-duration, "exact"]);
  }
  async nextFrame() {
    await this.context.command("frame-step");
  }
  async previousFrame() {
    await this.context.command("frame-back-step");
  }

  async setLoopA(position: TimePosition | null) {
    await this.context.setProperty("ab-loop-a", position == null ? "no" : position);
  }
  async setLoopAToCurrent() {
    const position = assertNonNull(await this.context.getProperty("time-pos/full", "double"));
    await this.context.setProperty("ab-loop-a", position);
    return position;
  }
  async setLoopB(position: TimePosition | null) {
    await this.context.setProperty("ab-loop-b", position == null ? "no" : position);
  }
  async setLoopBToCurrent() {
    const position = assertNonNull(await this.context.getProperty("time-pos/full", "double"));
    await this.context.setProperty("ab-loop-b", position);
    return position;
  }
  async setLoop(bounds: Bounds) {
    await this.setLoopA(bounds.a ?? null);
    await this.setLoopB(bounds.b ?? null);
  }
}
