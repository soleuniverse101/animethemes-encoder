<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Checkbox, Label, useId, type WithoutChildrenOrChild } from "bits-ui";

  type Props = Pick<WithoutChildrenOrChild<Checkbox.RootProps>, "id" | "checked"> & {
    text: string;
  };

  let { id = useId(), checked = $bindable(false), text }: Props = $props();
</script>

<span class="inline-flex items-center gap-1 pl-1">
  <Checkbox.Root {id} bind:checked>
    {#snippet children({ checked })}
      {#if checked}
        <Icon icon="mdi:checkbox-marked" />
      {:else}
        <Icon icon="mdi:checkbox-blank-outline" />
      {/if}
    {/snippet}
  </Checkbox.Root>
  <Label.Root for={id}>
    {text}
  </Label.Root>
</span>
