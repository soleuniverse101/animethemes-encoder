<script lang="ts" module>
  export type OptionInputValue = z4.$ZodNumber | z4.$ZodLiteral<string | number>;
</script>

<script lang="ts" generics="Type extends OptionInputValue">
  import type { FilterOptionInfo } from "$lib/app/encoding/filter.svelte";
  import { assertNonNull } from "$lib/utils/assert";
  import { Label, useId } from "bits-ui";
  import type z4 from "zod/v4/core";
  import Select from "../ui/Select.svelte";

  interface Props {
    info: FilterOptionInfo;
    schemaDef: Type["_zod"]["def"];
    value: z4.infer<OptionInputValue>;
  }

  let { info, schemaDef, value = $bindable() }: Props = $props();
</script>

<div class="flex items-center">
  {let id = useId()}
  <Label.Root for={id}>{info.title}</Label.Root>
  <!-- Not assigning type to a variable to get inference in the if block -->
  {#if schemaDef.type == "number"}
    <input {id} type="number" bind:value class="w-16" />
  {:else if schemaDef.type == "literal"}
    <Select
      {id}
      type="single"
      items={schemaDef.values
        .map((value) => assertNonNull(value).toString())
        .map((value) => ({ value, label: value }))}
      bind:value={() => value.toString(), (v) => (value = v)}
    />
  {/if}
</div>
