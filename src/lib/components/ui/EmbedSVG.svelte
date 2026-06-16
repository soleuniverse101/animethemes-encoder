<script lang="ts">
  import { assertNonNull } from "$lib/utils/assert";

  interface Props {
    href: string;
    title: string;
    class?: string;
  }

  let { href, title, class: _class }: Props = $props();

  let object: HTMLObjectElement | undefined = $state();

  const onload = () => {
    if (!object) {
      throw new Error();
    }
    const svg = assertNonNull(object.contentDocument?.getElementsByTagName("svg").item(0));
    svg.style.color = window.getComputedStyle(object).color;
  };
</script>

<!-- TODO security vulnerability ? -->
<object
  bind:this={object}
  {onload}
  onerror={() => {
    throw new Error(`EmbedSVG error (${href})`);
  }}
  data={href}
  type="image/svg+xml"
  {title}
  class={_class}
>
</object>
