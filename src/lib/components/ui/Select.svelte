<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Select, useId, type WithoutChildren } from "bits-ui";

  type Props = WithoutChildren<Select.RootProps> & {
    id?: string;
    placeholder?: string;
    items: { value: string; label: string; disabled?: boolean }[];
    contentProps?: WithoutChildren<Select.ContentProps>;
  };

  let {
    id = useId(),
    value = $bindable(),
    items,
    contentProps,
    placeholder,
    ...restProps
  }: Props = $props();
</script>

<!-- Cast as never because type of value depends of if Select type is single or multiple -->
<Select.Root bind:value={value as never} {...restProps}>
  <Select.Trigger {id} class="flex min-w-12 items-center justify-between">
    <Select.Value {placeholder} />
    <Icon icon="mdi:chevron-up-down" class="h-full" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content {...contentProps}>
      <Select.Viewport class="max-h-32">
        {#each items as { value, label, disabled } (value)}
          <Select.Item {value} {label} {disabled}>{label}</Select.Item>
        {/each}
      </Select.Viewport>
    </Select.Content>
  </Select.Portal>
</Select.Root>
