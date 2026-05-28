import type { UnlistenFn } from "@tauri-apps/api/event";

type Callback<Args extends unknown[]> = (...args: Args) => void;

export function createEventDispatcher<Args extends unknown[] = []>(): EventDispatcher<Args> {
  const subscribers: Map<number | string, Callback<Args>> = new Map();
  let currentId = 0;

  return {
    subscribe(callback: Callback<Args>, id?: string): UnlistenFn {
      const _id = id == null ? currentId++ : id;
      subscribers.set(_id, callback);
      return () => {
        subscribers.delete(_id);
      };
    },

    notify(...args: Args) {
      for (const callback of subscribers.values()) {
        callback(...args);
      }
    }
  };
}

type EventSubscriber<Args extends unknown[] = []> = (
  callback: Callback<Args>,
  id?: string
) => UnlistenFn;

export type EventDispatcher<Args extends unknown[] = []> = {
  /**
   * Registers {@link callback} as a subscriber to the associated event. An optional {@link id} can be
   * specified to assure a single subscriber exists for a given context. Only one subscriber can be
   * registered for a given {@link id}, the others will be unregistered.
   *
   * @param callback
   * @param id Optional.
   * @returns A callback to unsubscribe to this event.
   */
  subscribe: EventSubscriber<Args>;
  notify: Callback<Args>;
};
