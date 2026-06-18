<script lang="ts" module>
  // TODO add score / recommendations / tips / warnings on specific entries matched by a predicate
  type Entry = readonly [string, string];
  export type Info = {
    title: string;
    // nullish values allowed to ease input of optional entries with syntax : nullish ?? entry
    entries: (Entry | Info | null | undefined | false | "")[];
  };

  function isEntry(entry: unknown): entry is Entry {
    return (
      Array.isArray(entry) && entry.length == 2 && entry.every((value) => typeof value == "string")
    );
  }
  function filterEntries(entries: Info["entries"]): (Entry | Info)[] {
    return entries.filter(
      (entry) => entry != null && typeof entry != "boolean" && typeof entry != "string"
    );
  }
</script>

<script lang="ts">
  import Self from "./InfoEntries.svelte";

  interface Props {
    entries: Info["entries"];
    depth?: number;
  }

  let { entries, depth = 0 }: Props = $props();
</script>

{#each filterEntries(entries) as entry}
  {#if isEntry(entry)}
    {const [name, value] = entry}
    <tr
      class="not-last:not-[:has(+[data-section-heading=true])]:**:data-with-border:border-b contents"
    >
      <td style:padding-left={`${depth - 1}rem`} class="col-start-1">
        <div data-with-border class="h-full pl-4 content-center">
          <p>{name}</p>
        </div>
      </td>
      <td data-with-border class="content-center">
        <p class="pl-4">{value}</p>
      </td>
    </tr>
  {:else}
    <tr data-section-heading={depth == 0} class="contents"
      ><th
        colspan="2"
        scope="col"
        class="block text-start col-span-full"
        style:padding-left={`${depth}rem`}>{entry.title}</th
      ></tr
    >
    <Self entries={entry.entries} depth={depth + 1} />
  {/if}
{/each}
