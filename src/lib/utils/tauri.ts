import type { UnlistenFn } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

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
    if (typeof unlistens[i] == "function") {
      (unlistens.splice(i--, 1)[0] as UnlistenFn)();
    }
  }

  if (unlistens.length == 0) {
    return undefined as U extends UnlistenFn ? void : Promise<void>;
  }

  return Promise.all(
    (unlistens as Promise<UnlistenFn>[]).map((promise) => promise.then((unlisten) => unlisten()))
  ).then(() => {}) as U extends UnlistenFn ? void : Promise<void>;
}

type WebviewWindowInitOptions = {
  /**
   * Event to wait for before resolving the webviewWindow. If nothing is provided,
   * _tauri://webview-created_ is used.
   */
  waitFor?: Parameters<WebviewWindow["listen"]>[0];
  /**
   * Callback to run before resolving the webviewWindow. It'll be called after {@link waitFor} was
   * received.
   */
  init?: (webviewWindow: WebviewWindow) => Promise<void>;
};

/**
 * Create a webview window with a specific setup.
 *
 * @param label
 * @param options
 * @param initOptions
 */
export async function createWebviewWindow(
  label: ConstructorParameters<typeof WebviewWindow>[0],
  options: ConstructorParameters<typeof WebviewWindow>[1],
  initOptions: WebviewWindowInitOptions = {}
) {
  let unlistens: Promise<UnlistenFn>[] = [];
  const webviewWindow = await new Promise<WebviewWindow>((res, rej) => {
    const webviewWindow = new WebviewWindow(label, options);

    unlistens.push(
      webviewWindow.once(initOptions.waitFor ?? "tauri://webview-created", async () => {
        if (initOptions.init) {
          await initOptions.init(webviewWindow);
        }
        res(webviewWindow);
      }),
      webviewWindow.once("tauri://error", rej)
    );
  });
  unlistenAll(unlistens);

  return webviewWindow;
}
