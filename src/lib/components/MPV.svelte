<script lang="ts">
  import { destroy, getProperty } from "$lib/mpv/api";
  import {
    OBSERVABLE_PROPERTIES_FORMAT,
    type MPVListener,
    type ObservedProperties
  } from "$lib/mpv/listener";
  import { Positions, Sizes } from "$lib/utils/dpi";
  import { type UnlistenFn } from "@tauri-apps/api/event";
  import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { onDestroy, onMount } from "svelte";
  import { init, observeProperties, type MpvConfig } from "tauri-plugin-libmpv-api";

  interface Props {
    label: string;
    listener: MPVListener;
  }

  // If label needs to change, parent has to destroy the component then recreate it ({#key} can maybe do that)
  const { label, listener }: Props = $props();

  const mpvConfig: MpvConfig = {
    initialOptions: { "keep-open": "yes", pause: "yes" },
    observedProperties: listener.observedProperties
  };

  const main = getCurrentWebviewWindow();
  let mpv: WebviewWindow;

  let mpvDiv: HTMLDivElement;

  let unlistens: UnlistenFn[] = [];
  onMount(async () => {
    mpv =
      // (await WebviewWindow.getByLabel(label)) ??
      new WebviewWindow(label, {
        parent: main,
        url: "/mpv",

        transparent: true,
        decorations: false,
        shadow: false,
        resizable: false,
        focusable: false
      });

    unlistens.push(
      await mpv.once("tauri://webview-created", async () => {
        await init(mpvConfig, "mpv");

        unlistens.push(
          await observeProperties<ObservedProperties>(
            listener.observedProperties,
            ({ name, data }) => listener.update(name, data),
            label
          )
        );

        for (const [name, format] of listener.observedProperties) {
          try {
            listener.update(name, await getProperty(name, format));
          } catch (e) {
            if (OBSERVABLE_PROPERTIES_FORMAT.nullable[name]) {
              listener.update(name, null);
            } else {
              console.warn(`Failed to retrieve non-nullable property '${name}' at startup`);
            }
          }
        }
      }),
      await mpv.once("tauri://error", console.error),

      await main.onMoved(() => movePlayer()),
      await mpv.onFocusChanged(({ payload: focused }) => {
        if (focused) {
          const parent = main.setFocus();
        }
      })
    );

    await alignPlayer();
  });
  onDestroy(async () => {
    let unlisten: UnlistenFn | undefined;
    while ((unlisten = unlistens.pop())) {
      unlisten();
    }
    await destroy();
    await mpv.close();
  });

  async function alignPlayer() {
    const mpvRect = mpvDiv.getBoundingClientRect();
    await movePlayer(mpvRect);
    await mpv.setSize(Sizes.fromBoundingRect(mpvRect));
  }
  async function movePlayer(mpvRect = mpvDiv.getBoundingClientRect()) {
    await mpv.setPosition(
      Positions.add(
        await main.innerPosition(),
        Positions.fromBoundingRect(mpvRect),
        await main.scaleFactor()
      )
    );
  }
</script>

<svelte:window onresize={alignPlayer} />

<div bind:this={mpvDiv} class="h-[360px] w-[640px] bg-gray-400"></div>
