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
  }

  let { title, action }: Props = $props();
</script>

{#if action.type == "commandButton"}
  <Menubar.Item onSelect={() => command(action.command)()}>{title}</Menubar.Item>
{:else if action.type == "link"}
  <Menubar.Item class="link" onSelect={() => openUrl(action.href)}>{title}</Menubar.Item>
{:else if action.type == "button"}
  <Menubar.Item onSelect={action.callback}>{title}</Menubar.Item>
{/if}
