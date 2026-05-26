import { Positions } from "$lib/utils/dpi";
import { createEventDispatcher } from "$lib/utils/events";
import { unlistenAll } from "$lib/utils/tauri";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import type { MpvConfig } from "tauri-plugin-libmpv-api";
import { MPVWindowContext } from "./api";
import { MPVControls } from "./controls";
import { MPVListener, OBSERVABLE_PROPERTIES_FORMAT, type ObservedProperties } from "./listener";

const DEFAULT_MPV_CONFIG: MpvConfig = {
  initialOptions: { "keep-open": "yes", pause: "yes" }
};

export class MPVWindowManager {
  private readonly parent: WebviewWindow;
  private readonly windows: Map<string, MPVWindow> = new Map();
  private readonly windowsUnlistens: Map<string, UnlistenFn[]> = new Map();

  private readonly parentMoveUnlisten: Promise<UnlistenFn>;

  constructor(parent: WebviewWindow) {
    this.parent = parent;
    this.parentMoveUnlisten = this.parent.onMoved(() =>
      this.windows.values().forEach((window) => window.events.move.notify())
    );
  }

  async getOrCreateWindow(
    label: string,
    observedProperties: ObservedProperties.Name[] = []
  ): Promise<MPVWindow> {
    const window = this.windows.get(label);
    if (window) {
      const observedNames = window.mpvListener.observedProperties.map(([name]) => name);
      const unobservedProperties = observedProperties.filter(
        (name) => !observedNames.includes(name)
      );
      if (unobservedProperties.length > 0) {
        throw new Error(
          `MPVWindow with label '${label}' already exists but doesn't observe properties: ${unobservedProperties.join(", ")}`
        );
      }

      return window;
    }

    return this.createWindow(label, observedProperties);
  }

  async createWindow(
    label = "mpv",
    observedProperties: ObservedProperties.Name[] = []
  ): Promise<MPVWindow> {
    if (label in this.windows) {
      throw new Error(`MPVWindow label '${label}' already in use`);
    }

    const mpvContext = new MPVWindowContext(label);

    try {
      await mpvContext.getProperty("mpv-version", "string");
      console.warn(`Removing dangling MPV instance with label ${label}`);
      await mpvContext.destroy();
    } catch {}

    let window: WebviewWindow;
    const danglingWindow = await WebviewWindow.getByLabel(label);
    if (danglingWindow) {
      window = danglingWindow;
    } else {
      let windowUnlistens: Promise<UnlistenFn>[] = [];
      window = await new Promise<WebviewWindow>((res, rej) => {
        const window = new WebviewWindow(label, {
          parent: this.parent,
          url: "/mpv",

          transparent: true,
          decorations: false,
          shadow: false,
          resizable: false,
          focusable: false
        });

        windowUnlistens.push(
          window.once("tauri://webview-created", () => res(window)),
          window.once("tauri://error", ({ payload: error }) =>
            rej(`Failed to create MPVWindow with label ${label} :\n${error}`)
          )
        );
      });
      unlistenAll(windowUnlistens);
    }

    const mpvListener = new MPVListener(observedProperties);

    await mpvContext.init({
      ...DEFAULT_MPV_CONFIG,
      observedProperties: mpvListener.observedProperties
    });

    const mpvWindow = new MPVWindow({
      label,
      window,
      parent: this.parent,
      mpvContext,
      mpvListener
    });

    const unlistens: UnlistenFn[] = [];
    unlistens.push(
      // TODO make child window unfocusable
      await window.onFocusChanged(({ payload: focused }) => {
        if (focused) {
          mpvWindow.parent.setFocus();
        }
      }),
      // TODO remove generics
      await mpvContext.observeProperties<ObservedProperties>(
        mpvListener.observedProperties,
        ({ name, data }) => mpvWindow.mpvListener.update(name, data)
      )
    );
    await mpvWindow.forcePropertiesUpdate();

    this.windowsUnlistens.set(label, unlistens);
    this.windows.set(label, mpvWindow);
    return mpvWindow;
  }

  async destroy() {
    this.windowsUnlistens.values().forEach(unlistenAll);
    (await this.parentMoveUnlisten)();
  }

  async destroyWindows() {
    // Destroys all windows concurrently
    await Promise.all(Object.values(this.windows).map((window) => this.destroyWindow(window)));
  }

  async destroyWindow(window: MPVWindow) {
    this.windows.delete(window.label);
    const unlistens = this.windowsUnlistens.get(window.label)!;
    this.windowsUnlistens.delete(window.label);
    unlistenAll(unlistens);

    await window.mpvContext.destroy();
    await window.window.close();
  }
}

export class MPVWindow {
  readonly label: string;
  readonly window: WebviewWindow;
  readonly parent: WebviewWindow;
  readonly mpvContext: MPVWindowContext;

  readonly mpvListener: MPVListener;
  readonly controls: MPVWindowControls;
  readonly events = {
    move: createEventDispatcher()
  };

  readonly mpvControls: MPVControls;

  /**
   * DO NOT USE THIS. {@link MPVWindow}s must be created through a {@link MPVWindowManager}
   */
  constructor({
    label,
    window,
    parent,
    mpvContext,
    mpvListener
  }: {
    -readonly [Property in keyof Omit<
      MPVWindow,
      "controls" | "events" | "mpvControls" | "forcePropertiesUpdate"
    >]: MPVWindow[Property];
  }) {
    this.label = label;
    this.window = window;
    this.parent = parent;
    this.mpvContext = mpvContext;
    this.mpvListener = mpvListener;
    this.controls = {
      label,
      setPosition: async function (position) {
        window.setPosition(
          Positions.add(await parent.innerPosition(), position, await parent.scaleFactor())
        );
      },
      setSize: (size) => window.setSize(size),
      subscribeTo: {
        move: this.events.move.subscribe
      }
    };
    this.mpvControls = new MPVControls(label, this.mpvListener.getView(), mpvContext);
  }

  /** Sends {@link mpvListener} all current property values (even if they're null) */
  async forcePropertiesUpdate() {
    for (const [name, format] of this.mpvListener.observedProperties) {
      try {
        this.mpvListener.update(name, await this.mpvContext.getProperty(name, format));
      } catch (e) {
        if (OBSERVABLE_PROPERTIES_FORMAT.nullable[name]) {
          this.mpvListener.update(name, null);
        } else {
          console.warn(`Failed to retrieve non-nullable property '${name}' at startup`);
        }
      }
    }
  }
}

type MPVWindowEvents = MPVWindow["events"];

export interface MPVWindowControls {
  label: string;
  /**
   * Set position relative to parent origin.
   *
   * @param position
   */
  setPosition(position: Parameters<WebviewWindow["setPosition"]>[0]): Promise<void>;
  setSize(size: Parameters<WebviewWindow["setSize"]>[0]): Promise<void>;
  subscribeTo: {
    [E in keyof MPVWindowEvents]: MPVWindowEvents[E]["subscribe"];
  };
}
