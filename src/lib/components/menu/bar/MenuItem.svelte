<script lang="ts">
  import { command, type Command } from "$lib/app/commands";
  import { openUrl } from "@tauri-apps/plugin-opener";
  import { Menubar } from "bits-ui";

  type Action =
    | {
        type: "commandButton";
        // TODO add support for parametered command
        command: Command.Parameterless.Name;
      }
    | {
        type: "link";
        href: string;
      }
    | {
        type: "button";
        callback: () => void;
      };

  interface Props {
    title: string;
    action: Action;
    class?: string;
  }

  let { title, action, class: _class }: Props = $props();
</script>

{#if action.type == "commandButton"}
  <Menubar.Item class={_class} onSelect={() => command(action.command)()}>{title}</Menubar.Item>
{:else if action.type == "link"}
  <Menubar.Item class={["link", _class]} onSelect={() => openUrl(action.href)}>{title}</Menubar.Item
  >
{:else if action.type == "button"}
  <Menubar.Item class={_class} onSelect={action.callback}>{title}</Menubar.Item>
{/if}
