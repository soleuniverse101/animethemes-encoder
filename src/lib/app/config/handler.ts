import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import { type Config } from ".";
import { registerHandler } from "../commands";

export type ConfigHandler = {
  save: () => Promise<void>;
};

export type ConfigHandlerContext = {
  config: Config;
};

export const registerConfigHandler = ({ config }: ConfigHandlerContext) =>
  registerHandler("config", {
    save: () =>
      writeTextFile("recent.json", JSON.stringify(config.recent), {
        baseDir: BaseDirectory.AppLocalData
      })
  });
