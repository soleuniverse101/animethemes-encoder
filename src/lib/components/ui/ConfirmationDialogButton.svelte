<script lang="ts">
  import { AlertDialog } from "bits-ui";
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    description: string;
    action: () => void;
    cancel?: () => void;
    children?: Snippet;
  }

  let {
    title,
    description,
    action,
    cancel,
    children,
    open = $bindable(false)
  }: Pick<AlertDialog.RootProps, "open"> & Props = $props();
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Trigger>{children?.()}</AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Overlay />
    <AlertDialog.Content>
      <AlertDialog.Title class="text-center mb-2">{title}</AlertDialog.Title>
      <AlertDialog.Description>{description}</AlertDialog.Description>
      <div class="mt-4 flex justify-end gap-2">
        <AlertDialog.Cancel onclick={cancel} class="p-1 border-2 border-primary-400"
          >Cancel</AlertDialog.Cancel
        >
        <AlertDialog.Action
          onclick={() => {
            action();
            open = false;
          }}
          class="p-1 font-bold bg-primary-400">Confirm</AlertDialog.Action
        >
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
