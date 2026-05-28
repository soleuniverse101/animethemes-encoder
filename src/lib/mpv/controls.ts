import { assertNonNull } from "$lib/utils/assert";
import { FileUtils } from "$lib/utils/file";
import type { MPVWindowContext } from "./api";
import type { MPVListenerView } from "./listener";

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
    if (!path.trim().endsWith(".webm")) {
      throw new Error(`Unsupported video format (${FileUtils.extension(path)})`);
    }

    await this.context.command("loadfile", [path]);
  }

  async playPause() {
    await this.context.setProperty(
      "pause",
      (await this.context.getProperty("pause", "string")) == "yes" ? "no" : "yes"
    );
  }
  /** @param position Timecode in seconds. */
  async setPosition(position: number) {
    await this.context.command("seek", [position, "absolute"]);
  }

  async forwardSeek(duration: number = 5) {
    await this.context.command("seek", [duration, "exact"]);
  }
  async backwardSeek(duration: number = 5) {
    await this.context.command("seek", [-duration, "exact"]);
  }
  async nextFrame() {
    await this.context.command("frame-step");
  }
  async previousFrame() {
    await this.context.command("frame-back-step");
  }

  async setLoopA(position?: number) {
    await this.context.setProperty(
      "ab-loop-a",
      position ?? assertNonNull(await this.context.getProperty("time-pos/full", "double"))
    );
  }
  async setLoopB(position?: number) {
    await this.context.setProperty(
      "ab-loop-b",
      position ?? assertNonNull(await this.context.getProperty("time-pos/full", "double"))
    );
  }
}
