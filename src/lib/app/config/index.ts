import { appLocalDataDir, BaseDirectory } from "@tauri-apps/api/path";
import { exists, mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import z from "zod";
import { defaultProfile, Profile } from "../encoding/profile";

const Config = z.object({
  /** Sorted in reverse (first is most recent). */
  recent: z.array(z.string()),
  profile: Profile
});

export type Config = z.infer<typeof Config>;

export const RECENT_FILES_MAX_COUNT = 5;

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

  return { recent, profile: defaultProfile() };
}
