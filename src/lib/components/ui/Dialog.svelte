<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Dialog, Separator } from "bits-ui";
  import type { Snippet } from "svelte";

  interface Props {
    open: boolean;
    title?: string;
    children: Snippet;
    closeable?: boolean;
  }

  let { open = $bindable(), title, children, closeable = true }: Props = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content
      escapeKeydownBehavior={closeable ? "close" : "ignore"}
      interactOutsideBehavior={closeable ? "close" : "ignore"}
    >
      <!-- TODO eww -->
      <div class={[(title != null || closeable) && "mb-4"]}>
        {#if closeable}
          <Dialog.Close class="absolute top-1 right-1 pointereven">
            <Icon class="text-xl" icon="mdi:remove" />
          </Dialog.Close>
        {/if}
        {#if title != null}
          <Dialog.Title class="text-center mb-4">{title}</Dialog.Title>
          <Separator.Root />
        {/if}
      </div>
      {@render children()}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
