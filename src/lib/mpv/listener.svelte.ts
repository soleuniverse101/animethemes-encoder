import type { MpvObservableProperty, MpvPropertyData } from "tauri-plugin-libmpv-api";

const OBSERVABLE_PROPERTIES = [
  ["mpv-version", "string"] as const,
  ["duration", "double", "none"] as const,
  ["time-pos/full", "double", "none"] as const,
  ["pause", "flag"] as const,
  ["ab-loop-a", "double", "none"] as const,
  ["ab-loop-b", "double", "none"] as const,
  // Takes ints and "inf"
  ["ab-loop-count", "string"] as const
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

export type Listener = {
  [Property in ObservedProperties.Name]: ObservedProperties.DataFromName<Property>;
};

type Formats = {
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

/**
 * Stores observed properties that can be updated.
 *
 * **IMPORTANT** : Will initially be in an invalid state before all observed properties are properly
 * set using update. Until then, all the properties are set as null.
 */
export class MPVListener {
  // Necessary because MPVListener doesn't use generics to check which properties are listened to
  readonly observedProperties: ObservedProperties;
  /**
   * Use to set properties with minimal overhead. Note that for each property, {@link initProperty}
   * must be called at least once before setting through this.
   */
  readonly properties: Listener;
  private readonly setProperties: Map<ObservedProperties.Name, boolean>;

  constructor(observedProperties: ObservedProperties.Name[]) {
    const setProperties: Map<ObservedProperties.Name, boolean> = new Map(
      observedProperties.map((name) => [name, false])
    );
    this.setProperties = setProperties;
    this.observedProperties = OBSERVABLE_PROPERTIES.filter(([name]) => setProperties.has(name));

    const properties = $state({} as Listener);
    this.properties = new Proxy(properties, {
      get(target, property, receiver) {
        if (!setProperties.get(property as any)) {
          throw new Error(`Cannot retrieve unobserved property (${property.toString()})`);
        }
        return Reflect.get(target, property, receiver);
      },

      set(target, property, newValue, receiver) {
        if (!setProperties.get(property as any)) {
          throw new Error(`Cannot set unobserved property (${property.toString()})`);
        }
        return Reflect.set(target, property, newValue, receiver);
      }
    });
  }

  initProperty<N extends ObservedProperties.Name>(name: N, value: Listener[N]) {
    if (!this.setProperties.has(name)) {
      throw new Error(`Cannot init unobserved (${name})`);
    }
    this.setProperties.set(name, true);
    this.properties[name] = value;
  }

  getView(): MPVListenerView {
    return this.properties;
  }
}

export type MPVListenerView = Readonly<Listener>;
