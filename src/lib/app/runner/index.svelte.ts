import { assertNonNull } from "$lib/utils/assert";
import { createPromiseCallback } from "$lib/utils/async";
import { Nullable } from "$lib/utils/math";
import { catchToConsole } from "$lib/utils/tauri";
import type { Child, Command } from "@tauri-apps/plugin-shell";
import { CommandBuilder } from "../encoding/commands/builder";
import { ProgressReader } from "../encoding/ffmpeg/progress";
import type { RunJobPayload } from "./schedule";

export class JobRunner {
  // TODO manage differently with states ? (to prevent blindly idling on first pass)
  private time: number | null = $state(0);
  readonly progress: number | null;
  // TODO use createSubscriber ?
  private progressReader = new ProgressReader(({ out_time_us }) => {
    if (out_time_us != null) {
      this.time = out_time_us / 1000000;
    }
  });
  private cmds: { cmd: Command<string>; text: string }[];
  /** Should never be null after JobRunner was started. */
  private current: Child | null = null;
  readonly stderr = $state("");
  readonly cancelled = $state(false);
  private cancelCallback: () => void;
  private cancelPromise: Promise<void>;

  constructor({
    cmds: cmdsInputs,
    destination,
    duration
  }: Pick<RunJobPayload, "cmds" | "destination" | "duration">) {
    this.progress = $derived(Nullable.div(this.time, duration));
    this.cmds = cmdsInputs.map((input) => {
      const cmd = CommandBuilder.build(input, { cwd: destination });
      cmd.stdout.on("data", (line) => catchToConsole(() => this.progressReader.line(line)));
      cmd.stderr.on(
        "data",
        (line) => ((this.stderr as string) += line.includes("\n") ? line : line + "\n")
      );
      cmd.on("close", ({ code, signal }) =>
        catchToConsole(() => {
          if (code != 0) {
            // TODO present errors to user in case command fails because of them
            throw new Error(
              // TODO Replace by CommandBuilder.import (or fromJSON) function
              `Command failed with code ${code}, signal ${signal}:\n${[input.program, ...input.args].join(" ")}`
            );
          } else if (this.cancelled) {
            console.log("Job cancelled, not proceeding with next command.");
            this.cancelCallback();
            return;
          }
          this.nextCommand();
        })
      );
      return { cmd, text: `${input.program} ${input.args.join(" ")}` };
    });
    let [cancelPromise, cancelCallback] = createPromiseCallback();
    this.cancelPromise = cancelPromise;
    this.cancelCallback = cancelCallback;
  }

  private async nextCommand() {
    const next = this.cmds.shift();
    if (!next) {
      return;
    }

    (this.stderr as string) += next.text;
    this.current = await next.cmd.spawn();
  }

  async start() {
    if (this.current) {
      throw new Error("Cannot start JobRunner twice.");
    }
    await this.nextCommand();
  }

  /**
   * Cancels the job by stopping the current command and ignoring ones after. If called after
   * cancellation, it'll resolve once the cancellation is completed, or instantly resolve it
   * cancellation was already completed before the call.
   */
  async cancel() {
    if (this.cancelled) {
      return await this.cancelPromise;
    }
    (this.cancelled as boolean) = true;
    await assertNonNull(this.current).write("q");
    await this.cancelPromise;
  }
}
