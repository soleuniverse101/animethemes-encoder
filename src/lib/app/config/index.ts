import { appLocalDataDir, BaseDirectory } from "@tauri-apps/api/path";
import { exists, mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import z from "zod";

const Config = z.object({
  recent: z.array(z.string())
});

export type Config = z.infer<typeof Config>;

export async function initConfig(): Promise<Config> {
  const localDir = await appLocalDataDir();
  if (!(await exists(localDir))) {
    await mkdir(localDir);
  }

  let recent: Config["recent"];
  if (await exists("recent.json", { baseDir: BaseDirectory.AppLocalData })) {
    recent = Config.shape.recent.parse(
      JSON.parse(await readTextFile("recent.json", { baseDir: BaseDirectory.AppLocalData }))
    );
  } else {
    await writeTextFile("recent.json", JSON.stringify([]), { baseDir: BaseDirectory.AppLocalData });
    recent = [];
  }

  return { recent };
}
