import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import { registerHandler } from "../commands";
import type { App } from "../index.svelte";

export type ConfigHandler = {
  save: () => Promise<void>;
};

export type ConfigHandlerContext = {
  app: App;
};

export const registerConfigHandler = ({ app }: ConfigHandlerContext) =>
  registerHandler("config", {
    save: () =>
      writeTextFile("recent.json", JSON.stringify(app.config.recent), {
        baseDir: BaseDirectory.AppLocalData
      })
  });
