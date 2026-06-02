import { family } from "@tauri-apps/plugin-os";
import { Command } from "@tauri-apps/plugin-shell";

const os = family();
if (os != "unix" && os != "windows") {
  throw new Error("OSes other than Linux and Windows are currently not supported.");
}

export const NULL_DEVICE = os == "windows" ? "NUL" : "/dev/null";

export class CommandBuilder {
  readonly program: string;
  private args: string[] = [];

  constructor(program: string) {
    this.program = program;
  }

  clone() {
    const builder = new CommandBuilder(this.program);
    builder.args = this.args.slice();
    return builder;
  }

  add(part: string) {
    this.args.push(part);
    return this;
  }

  addArgument(arg: string, value?: string) {
    this.args.push(`-${arg}`);
    if (value) {
      this.args.push(`${value}`);
    }
    return this;
  }

  addOutput(output: [format: "webm", destination: string] | null) {
    if (output == null) {
      this.addArgument("f", "null");
      this.add(NULL_DEVICE);
    } else {
      this.addArgument("f", output[0]);
      this.add(output[1]);
    }
    return this;
  }

  compile() {
    return [this.program, ...this.args].join(" ");
  }
  getArgs(): readonly string[] {
    return this.args;
  }

  build() {
    return Command.create(this.program, this.args);
  }
}
