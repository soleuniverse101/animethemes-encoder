import { family } from "@tauri-apps/plugin-os";
import { Command } from "@tauri-apps/plugin-shell";

const os = family();
if (os != "unix" && os != "windows") {
  throw new Error("OSes other than Linux and Windows are currently not supported.");
}

export const NULL_DEVICE = os == "windows" ? "NUL" : "/dev/null";

type Argument = Readonly<
  | {
      type: "positional";
      value: string;
    }
  | {
      type: "flag";
      name: string;
    }
  | {
      type: "option";
      name: string;
      value: string;
    }
>;

/**
 * TODO if multiple inputs with different associated options are needed, create "CommandPart" that
 * has the same structure as CommandBuilder the args map is localized, then builder may store each
 * part individually and the caller can reference them by ID.
 */
export class CommandBuilder {
  readonly program: string;
  private args: Map<string, Argument> = new Map();
  private positionalKey = 0;

  constructor(program: string) {
    this.program = program;
  }

  private nextKey() {
    return (this.positionalKey++).toString();
  }

  addPositional(value: string) {
    this.args.set(this.nextKey(), { type: "positional", value });
  }

  setFlag(name: string) {
    name = `-${name}`;
    this.args.set(name, { type: "flag", name });
    return this;
  }

  // TODO
  /** Cannot be reset later. */
  private addFlag(name: string) {
    name = `-${name}`;
    this.args.set(this.nextKey(), { type: "flag", name });
    return this;
  }

  setOption(name: string, value: string | number) {
    name = `-${name}`;
    this.args.set(name, { type: "option", name, value: value.toString() });
    return this;
  }

  // TODO
  private addOption(name: string, value: string | number) {
    name = `-${name}`;
    this.args.set(this.nextKey(), { type: "option", name, value: value.toString() });
    return this;
  }

  addOutput(format: "webm" | null, destination: string | null) {
    this.addOption("f", format ?? "null");
    if (destination == null) {
      this.addPositional(NULL_DEVICE);
    } else {
      this.addPositional(destination);
    }
    return this;
  }

  /** @returns A copied list of the arguments. */
  private getArgs(): string[] {
    return this.args
      .values()
      .toArray()
      .flatMap((arg) => {
        switch (arg.type) {
          case "positional":
            return arg.value;
          case "flag":
            return arg.name;
          case "option":
            return [arg.name, arg.value];
        }
      });
  }

  clone() {
    const builder = new CommandBuilder(this.program);
    builder.args = new Map(this.args);
    return builder;
  }

  // TODO depending on platform, escape arguments & paths, and add quotes
  compile() {
    return [this.program, ...this.getArgs()].join(" ");
  }
  build() {
    return Command.create(this.program, this.getArgs());
  }
}
