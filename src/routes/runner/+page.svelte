<script lang="ts">
  import { CommandBuilder } from "$lib/app/encoding/commands/builder";
  import { ProgressReader } from "$lib/app/encoding/ffmpeg/progress";
  import type { RunJobPayload } from "$lib/app/encoding/runner";
  import Progress from "$lib/components/ui/Progress.svelte";
  import { Nullable } from "$lib/utils/math";
  import { catchToConsole, waitForPayload } from "$lib/utils/tauri";
  import Icon from "@iconify/svelte";
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

  const cmds = cmdsInputs.map((input) => {
    const cmd = CommandBuilder.build(input, { cwd: destination });
    cmd.stdout.on("data", (line) => catchToConsole(() => progressReader.line(line)));
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

        const next = cmds.pop();
        if (next) {
          next.spawn().then((child) => (current = child));
        }
      })
    );
    return cmd;
  });

  // TODO add folded logs section
  // cmd.stderr.on("data", console.log);
  // cmd.on("close", console.log);

  async function cancel() {
    cancelled = true;
    await current.write("q");
  }

  current = await cmds.shift()!.spawn();
</script>

<main class="w-full p-2">
  <h1 class="text-center mb-2">Job Runner</h1>
  <div class="w-full bg-primary-300 flex flex-col gap-2 p-2">
    <div class="flex justify-between items-center pl-2">
      <p>{title}</p>
      line
      <div class="flex gap-2">
        <button
          disabled={cancelled}
          onclick={cancel}
          title="Cancel job"
          class="bg-primary-200 p-2 disabled:opacity-40 disabled:cursor-not-allowed"
          ><Icon icon="mdi:remove" /></button
        >
      </div>
    </div>
    <Progress class="bg-primary-200" label="Computing frames..." value={progress ?? 0} />
  </div>
  <!-- TODO add folded logs section -->
  <!-- <pre>{result}</pre> -->
</main>
