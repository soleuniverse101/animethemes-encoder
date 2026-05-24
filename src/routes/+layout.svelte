<script lang="ts">
  import "./layout.css";

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
</script>

{@render children()}
