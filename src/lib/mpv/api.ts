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

export class MPVWindowContext {
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
