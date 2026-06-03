import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import { RECENT_FILES_MAX_COUNT, type Config } from ".";
import { registerHandler } from "../commands";

export type ConfigHandler = {
  save: () => Promise<void>;
  recent: {
    add: (path: string) => void;
  };
};

export type ConfigHandlerContext = {
  config: Config;
};

export const registerConfigHandler = ({ config }: ConfigHandlerContext) =>
  registerHandler("config", {
    save: () =>
      writeTextFile("recent.json", JSON.stringify(config.recent), {
        baseDir: BaseDirectory.AppLocalData
      }),
    recent: {
      add(path) {
        const { recent } = config;
        if (recent.includes(path)) {
          return;
        }
        if (recent.length < RECENT_FILES_MAX_COUNT) {
          recent.unshift(path);
        } else {
          config.recent = [path, ...recent.slice(0, -1)];
        }
      }
    }
  });
