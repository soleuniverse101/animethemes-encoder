<script lang="ts" module>
  import type { StreamInfo } from "$lib/app/encoding/source/info";
  import { toSentenceCase } from "$lib/utils/string";

  // TODO add score / recommendations / tips / warnings on specific entries matched by a predicate
  type Entry = readonly [string, string];
  type Info = {
    title: string;
    // nullish values allowed to ease input of optional entries with syntax : nullish ?? entry
    entries: (Entry | Info | null | undefined | false | "")[];
  };

  function isEntry(entry: unknown): entry is Entry {
    return (
      Array.isArray(entry) && entry.length == 2 && entry.every((value) => typeof value == "string")
    );
  }
  /**
   * @param info
   * @param index Index of the stream relative to others of its type or null if it's the only one.
   * @param additionalEntries
   */
  export function streamDefault(
    info: StreamInfo,
    index: number | null,
    additionalEntries: Info["entries"] = []
  ): Info {
    return {
      // TODO rename subtitle to text ?
      title: toSentenceCase(info.codec_type) + (index == null ? "" : ` #${index}`),
      entries: [
        // TODO hide ID ?
        ["ID", info.index.toString()],
        ["Codec (Format)", `${info.codec_long_name} (${info.codec_name})`],
        ...additionalEntries
      ]
    };
  }
</script>

<script lang="ts">
  interface Props {
    info: Info;
  }

  const { info }: Props = $props();
</script>

{#snippet entries(_entries: Info["entries"])}
  {#each _entries as entry}
    {#if entry != null && typeof entry != "boolean" && typeof entry != "string"}
      {#if isEntry(entry)}
        {const [name, value] = entry}
        <tr>
          <!-- TODO correctly handle/align successive nesting if level ever > 1 -->
          <td class="pl-4">{name}</td>
          <td class="text-start">{value}</td>
        </tr>
      {:else}
        <tr><th>{entry.title}</th></tr>
        {@render entries(entry.entries)}
      {/if}
    {/if}
  {/each}
{/snippet}

<table class="w-full table-fixed mx-4">
  <thead>
    <tr>
      <th class="w-2/5 text-start">{info.title}</th>
    </tr>
  </thead>
  <tbody class="mx-2">
    {@render entries(info.entries)}
  </tbody>
</table>
