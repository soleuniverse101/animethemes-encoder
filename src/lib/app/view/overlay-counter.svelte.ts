import { SvelteMap } from "svelte/reactivity";

export class OverlayCounter {
  private overlays: SvelteMap<string, boolean> = new SvelteMap();
  readonly open = $derived(this.overlays.values().some((open) => open));

  set(id: string, open: boolean) {
    this.overlays.set(id, open);
  }

  getOverlaySetter(id: string) {
    return (open: boolean) => this.overlays.set(id, open);
  }
}
