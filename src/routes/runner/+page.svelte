<script lang="ts">
  import { CommandBuilder } from "$lib/app/encoding/commands/builder";
  import { ProgressReader } from "$lib/app/encoding/ffmpeg/progress";
  import type { RunJobPayload } from "$lib/app/encoding/runner";
  import JobRunner from "$lib/components/runner/JobRunner.svelte";
  import { Nullable } from "$lib/utils/math";
  import { catchToConsole, waitForPayload } from "$lib/utils/tauri";
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { Child } from "@tauri-apps/plugin-shell";

  const runner = getCurrentWebviewWindow();
  const payload = waitForPayload<RunJobPayload>(runner, "run-job");
  await runner.emit("runner-ready");

  const { cmds: cmdsInputs, destination, duration, title } = await payload;

  let time: number | null = $state(null);
  let progress = $derived(Nullable.div(time, duration));
  // TODO use createSubscriber ?
  const progressReader = new ProgressReader(({ out_time_us }) => {
    if (out_time_us != null) {
      time = out_time_us / 1000000;
    }
  });

  let current: Child;
  let cancelled = $state(false);
  let stderr = $state("");

  async function nextCommand() {
    const next = cmds.pop();
    if (!next) {
      return;
    }

    stderr += next.text;
    next.cmd.spawn().then((child) => (current = child));
  }

  const cmds = cmdsInputs.map((input) => {
    const cmd = CommandBuilder.build(input, { cwd: destination });
    cmd.stdout.on("data", (line) => catchToConsole(() => progressReader.line(line)));
    cmd.stderr.on("data", (line) => (stderr += line.includes("\n") ? line : line + "\n"));
    cmd.on("close", ({ code, signal }) =>
      catchToConsole(() => {
        if (code != 0) {
          throw new Error(
            // TODO Replace by CommandBuilder.import (or fromJSON) function
            `Command failed with code ${code}, signal ${signal}:\n${[input.program, ...input.args].join(" ")}`
          );
        } else if (cancelled) {
          console.log("Job cancelled, not proceeding with next command.");
          return;
        }
        nextCommand();
      })
    );
    return { cmd, text: `${input.program} ${input.args.join(" ")}` };
  });

  async function cancel() {
    cancelled = true;
    await current.write("q");
  }

  nextCommand();
</script>

<main class="w-full grow p-2 flex flex-col">
  <h1 class="text-center mb-2">Job Runner</h1>
  <JobRunner {title} {cancelled} {cancel} progress={progress ?? 0} {stderr} />
</main>
