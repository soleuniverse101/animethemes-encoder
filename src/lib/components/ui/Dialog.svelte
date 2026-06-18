<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Dialog, Separator } from "bits-ui";
  import type { Snippet } from "svelte";

  interface Props {
    open: boolean;
    title: string;
    children: Snippet;
  }

  let { open = $bindable(), title, children }: Props = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50" />
    <Dialog.Content class="fixed top-1/2 left-1/2 -translate-1/2 z-50 p-2 min-w-80">
      <Dialog.Title class="text-center">{title}</Dialog.Title>
      <Dialog.Close class="absolute top-1 right-1 pointereven">
        <Icon class="text-xl" icon="mdi:remove" />
      </Dialog.Close>
      <Separator.Root class="my-4" />
      {@render children()}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
