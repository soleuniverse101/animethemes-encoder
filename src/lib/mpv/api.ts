import type { UnlistenFn } from "@tauri-apps/api/event";
import {
  command as _command,
  destroy as _destroy,
  getProperty as _getProperty,
  init as _init,
  observeProperties as _observeProperties,
  setProperty as _setProperty,
  type MpvConfig,
  type MpvEventFromProperties,
  type MpvFormat,
  type MpvFormatToType,
  type MpvObservableProperty
} from "tauri-plugin-libmpv-api";

class MPVWindowContext {
  readonly label: string;

  constructor(label: string) {
    this.label = label;
  }

  init(mpvConfig?: MpvConfig): Promise<string> {
    return _init(mpvConfig, this.label);
  }
  destroy(): Promise<void> {
    return _destroy(this.label);
  }

  getProperty<T extends MpvFormat>(name: string, format: T): Promise<MpvFormatToType[T] | null> {
    return _getProperty(name, format, this.label);
  }
  setProperty(name: string, value: string | boolean | number): Promise<void> {
    return _setProperty(name, value, this.label);
  }

  async command(name: string, args?: (string | boolean | number)[]): Promise<void> {
    return _command(name, args, this.label);
  }

  observeProperties<const T extends ReadonlyArray<MpvObservableProperty>>(
    properties: T,
    callback: (event: MpvEventFromProperties<T[number]>) => void
  ): Promise<UnlistenFn> {
    return _observeProperties(properties, callback, this.label);
  }
}

export const MPV_WINDOW_LABEL = "mpv";
const context = new MPVWindowContext(MPV_WINDOW_LABEL);

export const init = context.init.bind(context);
export const destroy = context.destroy.bind(context);
export const getProperty = context.getProperty.bind(context);
export const setProperty = context.setProperty.bind(context);
export const command = context.command.bind(context);
export const observeProperties = context.observeProperties.bind(context);
