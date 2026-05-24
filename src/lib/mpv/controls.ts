import { FileUtils } from "$lib/utils/file";
import { command, getProperty, MPV_WINDOW_LABEL, setProperty } from "./api";

export namespace MPVControls {
  export type Command = Exclude<keyof MPVControls, "label">;

  // First comparing C to any triggers an iteration over all possible types,
  // without it the whole type (not each of its union members) is directly compared to []
  // reference : https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
  type _ParameterlessCommand<C extends Command = Command> = C extends any
    ? Parameters<MPVControls[C]> extends []
      ? C
      : never
    : never;
  export type ParameterlessCommand = _ParameterlessCommand<Command>;
}

export class MPVControls {
  readonly label: string;

  constructor(label: string = MPV_WINDOW_LABEL) {
    this.label = label;
  }

  async loadFile(path: string) {
    if (!path.trim().endsWith(".webm")) {
      throw new Error(`Unsupported video format (${FileUtils.extension(path)})`);
    }

    await command("loadfile", [path]);
  }

  async playPause() {
    setProperty("pause", (await getProperty("pause", "string")) == "yes" ? "no" : "yes");
  }

  async nextFrame() {
    await command("frame-step");
  }
  async previousFrame() {
    await command("frame-back-step");
  }
}
