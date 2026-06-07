import type { UnlistenFn } from "@tauri-apps/api/event";
import hotkeys from "hotkeys-js";
import { command, type Command } from "../commands";

type ParameteredCommands = {
  [Name in Command.Parametered.Name]: Parameters<Command.FromName<Name>>;
};
type ParameteredCommand<C extends Command.Parametered.Name = Command.Parametered.Name> =
  C extends any ? [C, () => [...ParameteredCommands[C]]] : never;
export type ShortcutsMap = Record<string, Command.Parameterless.Name | ParameteredCommand>;

export function registerShortcuts(shortcuts: ShortcutsMap): UnlistenFn {
  const shortcutsList: string[] = [];

  for (const [keys, commandInfo] of Object.entries(shortcuts)) {
    if (typeof commandInfo == "string") {
      hotkeys(keys, (event) => {
        // TODO should we prevent for all shortcuts ? if not make it available to registerShortcuts API
        event.preventDefault();
        command(commandInfo)();
      });
    } else {
      hotkeys(keys, (event) => {
        event.preventDefault();
        (command(commandInfo[0]) as any)(...(commandInfo[1]() as any[]));
      });
    }
    shortcutsList.push(keys);
  }

  return () => {
    for (const shortcut of shortcutsList) {
      hotkeys.unbind(shortcut);
    }
  };
}
