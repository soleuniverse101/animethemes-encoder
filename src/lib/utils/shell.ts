export class CommandBuilder {
  private command: string;
  private args: Map<string, string> = new Map();

  constructor(command: string) {
    this.command = command;
  }

  setArgument(arg: string, value: string) {
    this.args.set(`-${arg}`, value);
  }

  compile() {
    return `${this.command} ${this.args
      .entries()
      .map(([arg, val]) => `${arg} ${val}`)
      .toArray()
      .join(" ")}`;
  }
}
