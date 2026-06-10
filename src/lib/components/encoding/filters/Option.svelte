<script lang="ts" module>
  type OptionValue = z4.$ZodObject | OptionInputValue;
</script>

<script lang="ts" generics="Type extends OptionValue">
  import { schemaInfo } from "$lib/app/encoding/filters";
  import { assertNonNull } from "$lib/utils/assert";
  import z, { ZodObject } from "zod";
  import * as z4 from "zod/v4/core";
  import Option from "./Option.svelte";
  import OptionInput, { type OptionInputValue } from "./OptionInput.svelte";

  interface Props {
    schema: Type;
    value: z4.infer<Type>;
    invalidate: () => void;
  }

  let { schema, value = $bindable(), invalidate }: Props = $props();

  const schemaType = $derived(schema._zod.def.type);
</script>

<!-- TODO generalize to use in other tabs & settings menu -->

{#if schemaType == "object"}
  {const obj = schema as ZodObject}
  <div class="flex flex-col gap-1">
    {#each Object.keys(obj.keyof().enum) as key}
      <Option
        schema={obj.shape[key]}
        bind:value={(value as z4.infer<ZodObject>)[key]}
        {invalidate}
      />
    {/each}
  </div>
{:else}
  <!-- Type isn't z4.$ZodObject -->
  <OptionInput
    info={assertNonNull(schemaInfo.get(schema))}
    schemaDef={schema._zod.def as Exclude<Type, z4.$ZodObject>["_zod"]["def"]}
    bind:value={
      () => value as z.infer<Exclude<Type, z4.$ZodObject>>,
      (v) => {
        value = v;
        invalidate();
      }
    }
  />
{/if}
