<script lang="ts">
  import { onDestroy } from "svelte";
  import "../style/layout.css";
  import hotkeys from "hotkeys-js";

  const { children } = $props();

  // Disables focus of buttons after click to prevent accidental trigger with Space
  document.addEventListener("mouseup", (e) => {
    const target = e.target;

    if (!(target instanceof Element)) return;

    const button = target.closest('button, [role="button"]');
    if (button instanceof HTMLElement) {
      button.blur();
    }
  });

  hotkeys("space", (event) => {
    if (event.target == document.body) {
      event.preventDefault();
    }
  });

  onDestroy(() => hotkeys.unbind("space"));
</script>

{@render children()}
