<script lang="ts">
  import { assertNonNull } from "$lib/utils/assert";
  import Icon from "@iconify/svelte";
  import { check, Update } from "@tauri-apps/plugin-updater";
  import AlertDialog from "../ui/AlertDialog.svelte";
  import Dialog from "../ui/Dialog.svelte";
  import SpinningIcon from "../ui/SpinningIcon.svelte";

  let current = $state<"" | "checking" | "suggesting" | "updating">("");

  let update: Update | null = $state(null);
  let downloaded = $state(0);
  let contentLength = $state(0);
  const progress = $derived(downloaded / contentLength);

  async function checkUpdates() {
    current = "checking";
    // TODO better error handling
    try {
      update = await check();
    } catch {}
    if (!update) {
      current = "";
      return;
    }

    current = "suggesting";
  }

  async function startUpdate() {
    current = "updating";

    await assertNonNull(update).downloadAndInstall((event) => {
      switch (event.event) {
        case "Started":
          contentLength = assertNonNull(event.data.contentLength);
          break;
        case "Progress":
          downloaded += event.data.chunkLength;
          break;
      }
    });

    // TODO if handling other than Windows : await relaunch();
  }

  function removeUpdate() {
    update = null;
    current = "";
  }

  checkUpdates();
</script>

<button
  onclick={checkUpdates}
  disabled={current != ""}
  title={current == "checking" ? "Checking for updates..." : "Check for updates"}
  class="w-5 flex items-center"
>
  {#if current == "checking"}
    <SpinningIcon />
  {:else}
    <Icon icon="mdi:reload" class="text-lg" />
  {/if}
</button>

<AlertDialog
  open={current == "suggesting"}
  title="Update available"
  description="Would you like to update the app ?"
  action={startUpdate}
  cancel={removeUpdate}
  actionText="Yes, update"
  cancelText="No"
/>

<Dialog
  open={current == "updating"}
  closeable={false}
  title={`Updating... (${Math.round(progress * 100)}%)`}
  >Please wait while the app is updating. It will restart itself automatically once the update is
  done.
</Dialog>
