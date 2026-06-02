import { os } from "$lib/app/index.svelte";

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

  addOutput(output: string | null) {
    if (output == null) {
      // TODO replace for linux
      this.addArgument("f", "null");
      this.add(os == "windows" ? "NUL" : "/dev/null");
    }
    return this;
  }

  compile() {
    return [this.program, ...this.args].join(" ");
  }
  getArgs(): string[] {
    return this.args;
  }
}
