import {
  command as _command,
  destroy as _destroy,
  getProperty as _getProperty,
  setProperty as _setProperty,
  type MpvFormat,
  type MpvFormatToType
} from "tauri-plugin-libmpv-api";

class MPVWindowContext {
  readonly label: string;

  constructor(label: string) {
    this.label = label;
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

  destroy(): Promise<void> {
    return _destroy(this.label);
  }
}

export const MPV_WINDOW_LABEL = "mpv";
const context = new MPVWindowContext(MPV_WINDOW_LABEL);

export const getProperty = context.getProperty.bind(context);
export const setProperty = context.setProperty.bind(context);
export const command = context.command.bind(context);
export const destroy = context.destroy.bind(context);
