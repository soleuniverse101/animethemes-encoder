import { readonly, writable, type Readable, type Writable } from "svelte/store";
import type { MpvObservableProperty, MpvPropertyData } from "tauri-plugin-libmpv-api";

const OBSERVABLE_PROPERTIES = [
  ["mpv-version", "string"] as const,
  ["duration", "double", "none"] as const,
  ["time-pos/full", "double", "none"] as const,
  ["pause", "string"] as const,
  ["ab-loop-a", "double", "none"] as const,
  ["ab-loop-b", "double", "none"] as const
] satisfies MpvObservableProperty[];

export type ObservedProperties = typeof OBSERVABLE_PROPERTIES;
export namespace ObservedProperties {
  export type Name = ObservedProperties[number][0];
  export type FromName<N extends Name> = Extract<
    ObservedProperties[number],
    readonly [N, unknown] | readonly [N, unknown, "none", ...unknown[]]
  >;
  export type DataFromName<N extends Name> = MpvPropertyData<FromName<N>>;
}

export type Stores = {
  [Property in ObservedProperties.Name]: Writable<ObservedProperties.DataFromName<Property>>;
};
export type Formats = {
  type: { [Property in ObservedProperties.Name]: ObservedProperties.FromName<Property>[1] };
  nullable: {
    [Property in ObservedProperties.Name]: Extract<
      ObservedProperties.DataFromName<Property>,
      null
    > extends never
      ? false
      : true;
  };
};

export const OBSERVABLE_PROPERTIES_FORMAT: Formats = {
  type: Object.fromEntries(OBSERVABLE_PROPERTIES.map(([name, format]) => [name, format])),
  nullable: Object.fromEntries(
    OBSERVABLE_PROPERTIES.map(([name, _, ...rest]) => [name, rest[0] == "none"])
  )
} as any;

export class MPVListener {
  readonly observedProperties: ObservedProperties;
  // private readonly properties: Partial<ObservedProperties> = {};
  private readonly stores: Stores = {} as any;

  constructor(observedProperties: ObservedProperties.Name[]) {
    for (const prop of observedProperties) {
      this.stores[prop] = writable<any>();
    }
    this.observedProperties = OBSERVABLE_PROPERTIES.filter(([name]) => name in this.stores);
  }

  update<N extends ObservedProperties.Name>(name: N, value: ObservedProperties.DataFromName<N>) {
    // Necessary because MPVListener doesn't use generics to check which properties are listened to
    if (!(name in this.stores)) {
      throw new Error(`Property not observed (${name})`);
    }
    this.stores[name].set(value);
  }

  getView(): MPVListenerView {
    return {
      propertyStore: (name) => {
        if (name in this.stores) {
          return readonly(this.stores[name]);
        }
        throw new Error(`Property '${name}' is not observed`);
      }
    };
  }
}

export interface MPVListenerView {
  readonly propertyStore: <N extends ObservedProperties.Name>(
    name: N
  ) => Readable<ObservedProperties.DataFromName<N>>;
}
