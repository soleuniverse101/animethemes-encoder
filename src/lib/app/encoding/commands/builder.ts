import { family } from "@tauri-apps/plugin-os";
import { Command, type SpawnOptions } from "@tauri-apps/plugin-shell";
import { sortedArguments, type Args, type Argument, type Program } from "./args";

const os = family();
if (os != "unix" && os != "windows") {
  throw new Error("OSes other than Linux and Windows are currently not supported.");
}

const NULL_DEVICE = os == "windows" ? "NUL" : "/dev/null";

export type CommandInput = { program: string; args: string[] };

/**
 * TODO if multiple inputs with different associated options are needed, create "CommandPart" that
 * has the same structure as CommandBuilder the args map is localized, then builder may store each
 * part individually and the caller can reference them by ID.
 */
// TODO unit tests
export class CommandBuilder<P extends Program> {
  readonly program: P;
  private args: Map<string, Argument<P>> = new Map();

  constructor(program: P) {
    this.program = program;
  }

  // TODO add positionals in definition ? they'll then be set explicitly
  setPositional(name: Args.Positional<P>, value: string) {
    this.args.set(name, { type: "positional", name, value });
  }

  setFlag(name: Args.Flag<P>) {
    this.args.set(name, { type: "flag", name });
    return this;
  }

  // TODO
  /** Cannot be reset later. */
  // private addFlag(name: string) {
  //   this.args.set(this.nextKey(), { type: "flag", name });
  //   return this;
  // }

  setOption(name: Args.Option<P>, value: string | number) {
    this.args.set(name, { type: "option", name, value: value.toString() });
    return this;
  }

  // TODO and maybe set -f with addOption ?
  // private addOption(name: Args.Option<P>, value: string | number) {
  //   this.args.set(this.nextKey(), { type: "option", name, value: value.toString() });
  //   return this;
  // }

  setOutput(format: "webm" | null, destination: string | null) {
    this.setOption("f", format ?? "null");
    this.setPositional("output", destination ?? NULL_DEVICE);
    return this;
  }

  /** @returns A copied list of the arguments. */
  private getArgs(): string[] {
    return sortedArguments(this.program, this.args.values().toArray()).flatMap((arg) => {
      switch (arg.type) {
        case "positional":
          return arg.value;
        case "flag":
          return `-${arg.name}`;
        case "option":
          return [`-${arg.name}`, arg.value];
      }
    });
  }

  clone() {
    const builder = new CommandBuilder(this.program);
    builder.args = new Map(this.args);
    return builder;
  }

  export(): CommandInput {
    return { program: this.program, args: this.getArgs() };
  }
  // TODO depending on platform, escape arguments & paths, and add quotes
  compile() {
    return [this.program, ...this.getArgs()].join(" ");
  }
  build(options?: SpawnOptions) {
    return Command.create(this.program, this.getArgs(), options);
  }

  static build(input: CommandInput, options?: SpawnOptions) {
    return Command.create(input.program, input.args, options);
  }
}
