<script lang="ts" module>
  export type OptionInputValue = z4.$ZodNumber | z4.$ZodLiteral;
</script>

<script lang="ts" generics="Type extends OptionInputValue">
  import type { FilterOptionInfo } from "$lib/app/encoding/filter.svelte";
  import { Label, useId } from "bits-ui";
  import type z4 from "zod/v4/core";

  interface Props {
    info: FilterOptionInfo;
    schemaDef: Type["_zod"]["def"];
    value: z4.infer<OptionInputValue>;
  }

  let { info, schemaDef, value = $bindable() }: Props = $props();

  const { type } = $derived(schemaDef);
</script>

<div>
  {let id = useId()}
  <Label.Root for={id}>{info.title}</Label.Root>
  {#if type == "number"}
    <input {id} type="number" bind:value class="w-16" />
  {:else if type == "literal"}
    <!-- TODO replace by select -->
    <input {id} type="text" bind:value class="w-16" />
  {/if}
</div>
