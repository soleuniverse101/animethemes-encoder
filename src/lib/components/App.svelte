<script lang="ts">
  import { version } from "$app/environment";
  import { registerJobsHandler } from "$lib/app/commands/jobs";
  import type { Config } from "$lib/app/config";
  import { registerConfigHandler } from "$lib/app/config/handler";
  import { createApp, setApp } from "$lib/app/index.svelte";
  import EncodingSection from "$lib/components/encoding/EncodingSection.svelte";
  import MenuBar from "$lib/components/menu/bar/MenuBar.svelte";
  import MPVView from "$lib/components/mpv/MPVView.svelte";
  import type { MPVWindowManager } from "$lib/mpv/window";
  import { unlistenAll } from "$lib/utils/tauri";
  import { onDestroy } from "svelte";

  interface Props {
    config: Config;
    mpvWindowManager: MPVWindowManager;
  }

  const { config, mpvWindowManager }: Props = $props();

  const app = $state(createApp((() => config)()));
  setApp(app);

  const unlistens = [registerConfigHandler({ config: app.config }), registerJobsHandler({ app })];

  onDestroy(() => unlistenAll(unlistens));
</script>

<header class="sticky top-0 z-10 w-full max-w-4xl bg-background">
  <MenuBar />
</header>

<main class="flex h-max w-full max-w-4xl grow flex-col items-stretch gap-3 px-10 py-6">
  <MPVView {mpvWindowManager} />
  <EncodingSection />
</main>

<footer class="sticky bottom-0 w-full bg-primary-200 px-1 text-text-400">
  <div class="mx-auto flex w-full max-w-4xl justify-between">
    <!-- TODO link component or hande on_navigation in lib.rs Builder to prevent viewing external links in the app -->
    <span>by <a href="https://soleuniverse.me/" target="_blank">soleuniverse</a></span>
    <span>v{version}</span>
  </div>
</footer>
