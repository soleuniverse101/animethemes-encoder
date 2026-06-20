import { createWebviewWindow } from "$lib/utils/tauri";
import { basename, dirname } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import type { CommandBuilder, CommandInput } from "./commands/builder";
import type { CompilerContext } from "./compilers";

export type RunJobPayload = {
  cmds: [firstPass: CommandInput, secondPass: CommandInput];
  destination: string;
  title: string;
  duration: number;
};

type Commands = [firstPass: CommandBuilder<"ffmpeg">, secondPass: CommandBuilder<"ffmpeg">];
export async function runJobCommands(cmds: Commands, { file, job }: CompilerContext) {
  // TODO move ?
  const destination = await open({
    directory: true,
    title: "Choose a destination folder",
    defaultPath: await dirname(file)
  });
  if (!destination) {
    return;
  }

  cmds = cmds
    .map((cmd) => cmd.clone())
    .map((cmd) => {
      cmd.setOption("progress", "pipe:1");
      return cmd;
    }) as Commands;

  const title = `${job.label} (${await basename(file)})`;
  const {
    bounds: { start, end }
  } = job;
  const duration = end - start;

  // TODO allow multiple runners at once (with different labels)
  const runner = await createWebviewWindow(
    "runner",
    {
      url: "/runner",
      title,
      height: 400
    },
    {
      waitFor: "runner-ready",
      init: async (webviewWindow) =>
        webviewWindow.emit<RunJobPayload>("run-job", {
          cmds: cmds.map((cmd) => cmd.export()) as RunJobPayload["cmds"],
          destination,
          title,
          duration
        })
    }
  );
}
