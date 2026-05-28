import type { UnlistenFn } from "@tauri-apps/api/event";

/**
 * Because unlisten should only be called once, but also for performance purposes, this function
 * empties the passed list.
 *
 * @param unlistens
 */
export function unlistenAll<U extends UnlistenFn | Promise<UnlistenFn>>(
  unlistens: U[]
): U extends UnlistenFn ? void : Promise<void> {
  for (let i = 0; i < unlistens.length; i++) {
    const unlisten = unlistens[i];
    if (typeof unlisten == "function") {
      unlisten();
      unlistens.splice(i--, 1);
    }
  }

  if (unlistens.length == 0) {
    return undefined as U extends UnlistenFn ? void : Promise<void>;
  }

  return Promise.all(
    (unlistens as Promise<UnlistenFn>[]).map((promise) => promise.then((unlisten) => unlisten()))
  ).then(() => {}) as U extends UnlistenFn ? void : Promise<void>;
}
