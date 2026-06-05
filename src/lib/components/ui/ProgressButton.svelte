<script lang="ts">
  import { Button } from "bits-ui";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = {
    loading?: boolean;
  } & HTMLButtonAttributes;

  let { loading = false, children, class: _class, ...rest }: Props = $props();
</script>

<Button.Root class={"relative " + (_class ?? "")} {...rest}
  >{@render children?.()}
  {#if loading}
    <div class="absolute left-0 bottom-0 right-0 h-2 animate-wave-gradient"></div>
  {/if}</Button.Root
>
