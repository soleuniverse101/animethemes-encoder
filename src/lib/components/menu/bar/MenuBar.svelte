<script lang="ts">
  import { commands } from "$lib/app/commands";
  import { openUrl } from "@tauri-apps/plugin-opener";
  import { Menubar } from "bits-ui";

  type ItemType =
    | {
        type: "button";
        action: () => void;
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

  const { importFile } = commands("mpvView");

  const menus: Menu[] = [
    {
      title: "File",
      items: [{ title: "Open...", type: "button", action: () => importFile() }]
    },
    {
      title: "Help",
      items: [{ title: "AnimeThemes Wiki", type: "link", href: "https://animethemes.moe/wiki/" }]
    }
  ] as const;
</script>

<Menubar.Root class="px-2 select-none">
  {#each menus as { title, items }}
    <Menubar.Menu>
      <Menubar.Trigger>{title}</Menubar.Trigger>
      <Menubar.Content>
        {#each items as item}
          {#if item.type == "button"}
            <Menubar.Item onSelect={item.action}>{item.title}</Menubar.Item>
          {:else if item.type == "link"}
            <Menubar.Item onSelect={() => openUrl(item.href)}>{item.title}</Menubar.Item>
          {/if}
        {/each}
      </Menubar.Content>
    </Menubar.Menu>
  {/each}
</Menubar.Root>
