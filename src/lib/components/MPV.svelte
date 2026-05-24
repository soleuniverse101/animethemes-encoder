<script lang="ts">
  import { destroy } from "$lib/mpv/api";
  import { Positions, Sizes } from "$lib/utils/dpi";
  import type { UnlistenFn } from "@tauri-apps/api/event";
  import {
    getCurrentWebviewWindow,
    WebviewWindow,
  } from "@tauri-apps/api/webviewWindow";
  import { onDestroy, onMount } from "svelte";
  import {
    init,
    observeProperties,
    type MpvConfig,
    type MpvObservableProperty,
    type MpvPropertyData,
  } from "tauri-plugin-libmpv-api";

  interface Props {
    label: string;
  }

  // If label needs to change, parent has to destroy the component then recreate it ({#key} can maybe do that)
  const { label }: Props = $props();

  const OBSERVED_PROPERTIES = [
    ["time-pos/full", "string", "none"],
  ] as const satisfies MpvObservableProperty[];

  type ObservedPropertiesList = typeof OBSERVED_PROPERTIES;
  type ObservedPropertyName = ObservedPropertiesList[number][0];
  type ObservedPropertyFromName<Name extends ObservedPropertyName> = Extract<
    ObservedPropertiesList[number],
    readonly [Name, unknown] | readonly [Name, unknown, "none", ...unknown[]]
  >;
  type ObservedProperties = {
    [PropertyName in ObservedPropertyName]: MpvPropertyData<
      ObservedPropertyFromName<PropertyName>
    >;
  };
  const properties: ObservedProperties = { "time-pos/full": null };

  const mpvConfig: MpvConfig = {
    initialOptions: { "keep-open": "yes", pause: "yes" },
    observedProperties: OBSERVED_PROPERTIES,
  };

  const main = getCurrentWebviewWindow();
  let mpv: WebviewWindow;

  let mpvDiv: HTMLDivElement;

  let unlistenProperties: UnlistenFn;
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
        focusable: false,
      });

    mpv.once("tauri://webview-created", async () => {
      // const rawHandle = await invoke("get_webview_window_handle", {
      //   label,
      // });
      // if (typeof rawHandle != "number") {
      //   throw Error("Handle retrieval failed");
      // }

      // if (!mpvConfig.initialOptions) mpvConfig.initialOptions = {};
      // mpvConfig.initialOptions.wid = rawHandle;
      await init(mpvConfig, "mpv");

      unlistenProperties = await observeProperties(
        OBSERVED_PROPERTIES,
        ({ name, data }) => (properties[name] = data),
      );
    });
    mpv.once("tauri://error", console.error);

    main.onMoved(() => movePlayer());
    mpv.onFocusChanged(({ payload: focused }) => {
      if (focused) {
        const parent = main.setFocus();
      }
    });

    await alignPlayer();
  });
  onDestroy(async () => {
    if (unlistenProperties) {
      unlistenProperties();
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
        await main.scaleFactor(),
      ),
    );
  }
</script>

<svelte:window onresize={alignPlayer} />

<div bind:this={mpvDiv} class="w-[640px] h-[360px] bg-gray-400"></div>
