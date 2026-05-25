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
  private readonly windows: Record<string, MPVWindow> = {};

  private readonly parentMoveUnlisten: Promise<UnlistenFn>;

  constructor(parent: WebviewWindow) {
    this.parent = parent;
    this.parentMoveUnlisten = this.parent.onMoved(() =>
      Object.values(this.windows).forEach((window) => window.events.move.notify())
    );
  }

  async getOrCreateWindow(
    label = "mpv",
    observedProperties: ObservedProperties.Name[] = []
  ): Promise<MPVWindow> {
    if (label in this.windows) {
      const window = this.windows[label];

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

    const unlistens: UnlistenFn[] = [];

    let mpvWindow = new MPVWindow();
    const missingVariables = {
      label,
      window,
      parent: this.parent,
      mpvContext,
      unlistens,
      mpvListener,
      controls: {
        label,
        setPosition: async (position) =>
          window.setPosition(
            Positions.add(
              await this.parent.innerPosition(),
              position,
              await this.parent.scaleFactor()
            )
          ),
        setSize: (size) => window.setSize(size),
        subscribeTo: {
          move: mpvWindow.events.move.subscribe
        }
      },
      mpvControls: new MPVControls(label, mpvListener.getView(), mpvContext)
    } satisfies Omit<MPVWindow, "forcePropertiesUpdate" | "events">;
    Object.entries(missingVariables).forEach(([name, value]) => ((mpvWindow as any)[name] = value));

    unlistens.push(
      // TODO make child window unfocusable
      await window.onFocusChanged(({ payload: focused }) => {
        if (focused) {
          const parent = mpvWindow.parent.setFocus();
        }
      }),
      // TODO remove generics
      await mpvContext.observeProperties<ObservedProperties>(
        mpvListener.observedProperties,
        ({ name, data }) => mpvListener.update(name, data)
      )
    );
    await mpvWindow.forcePropertiesUpdate();

    this.windows[label] = mpvWindow;
    return mpvWindow;
  }

  async destroy() {
    // Destroys all windows concurrently
    await Promise.all([
      this.parentMoveUnlisten,
      ...Object.values(this.windows).map((window) => this.destroyWindow(window))
    ]);
  }

  async destroyWindow(window: MPVWindow) {
    unlistenAll(window.unlistens);
    await window.mpvContext.destroy();
    await window.window.close();
    delete this.windows[window.label];
  }
}

export class MPVWindow {
  readonly label!: string;
  readonly window!: WebviewWindow;
  readonly parent!: WebviewWindow;
  readonly mpvContext!: MPVWindowContext;
  readonly unlistens!: UnlistenFn[];

  readonly mpvListener!: MPVListener;
  readonly controls!: MPVWindowControls;
  readonly events = {
    move: createEventDispatcher()
  };

  readonly mpvControls!: MPVControls;

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
