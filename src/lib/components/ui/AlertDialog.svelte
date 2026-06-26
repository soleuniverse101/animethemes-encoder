<script lang="ts">
  import { getApp } from "$lib/app/index.svelte";
  import { AlertDialog } from "bits-ui";
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    description: string;
    action: () => void;
    cancel?: () => void;
    actionText?: string;
    cancelText?: string;
    trigger?: Snippet;
  }

  let {
    title,
    description,
    action,
    cancel,
    actionText,
    cancelText,
    trigger,
    open = $bindable(false)
  }: Pick<AlertDialog.RootProps, "open"> & Props = $props();

  const app = getApp();
  const id = $props.id();
  const setOverlayOpen = app.view.overlayCounter.getOverlaySetter(id);
  $effect(() => {
    setOverlayOpen(open);
  });

  function onOpenChange(open: boolean) {
    if (!open) {
      cancel?.();
    }
  }
</script>

<AlertDialog.Root bind:open {onOpenChange}>
  {#if trigger}
    <AlertDialog.Trigger>{@render trigger()}</AlertDialog.Trigger>
  {/if}
  <AlertDialog.Portal>
    <AlertDialog.Overlay />
    <AlertDialog.Content>
      <AlertDialog.Title class="text-center mb-2">{title}</AlertDialog.Title>
      <AlertDialog.Description>{description}</AlertDialog.Description>
      <div class="mt-4 flex justify-end gap-2">
        <AlertDialog.Cancel onclick={cancel} class="p-1 border-2 border-primary-400"
          >{cancelText ?? "Cancel"}</AlertDialog.Cancel
        >
        <AlertDialog.Action
          onclick={() => {
            action();
            open = false;
          }}
          class="p-1 font-bold bg-primary-400">{actionText ?? "Confirm"}</AlertDialog.Action
        >
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
