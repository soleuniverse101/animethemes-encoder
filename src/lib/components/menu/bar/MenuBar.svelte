<script lang="ts">
  import { command, type Command } from "$lib/app/commands";
  import { openUrl } from "@tauri-apps/plugin-opener";
  import { Menubar } from "bits-ui";

  type ItemType =
    | {
        type: "button";
        command: Command.Parameterless.Name;
      }
    | {
        type: "link";
        href: string;
      };
  type Item = {
    title: string;
  } & ItemType;
  type Menu = {
    title: string;
    items: Item[];
  };

  const menus: Menu[] = [
    {
      title: "File",
      items: [{ title: "Open...", type: "button", command: "mpvView.importFile" }]
    },
    {
      title: "Help",
      items: [{ title: "AnimeThemes Wiki", type: "link", href: "https://animethemes.moe/wiki/" }]
    }
  ] as const;
</script>

<Menubar.Root class="px-2 flex select-none">
  {#each menus as { title, items }}
    <Menubar.Menu>
      <Menubar.Trigger>{title}</Menubar.Trigger>
      <Menubar.Content align="start">
        {#each items as item}
          {#if item.type == "button"}
            <Menubar.Item onSelect={() => command(item.command)()}>{item.title}</Menubar.Item>
          {:else if item.type == "link"}
            <Menubar.Item class="link" onSelect={() => openUrl(item.href)}
              >{item.title}</Menubar.Item
            >
          {/if}
        {/each}
      </Menubar.Content>
    </Menubar.Menu>
  {/each}
</Menubar.Root>
