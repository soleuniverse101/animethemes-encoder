<script lang="ts">
  type Props =
    | {
        active: true;
        progress: number;
      }
    | {
        active: false;
        progress: typeof NaN;
      };

  let { active, progress = $bindable() }: Props = $props();
</script>

<div class="group relative h-1 w-full">
  {#if active}
    <input
      type="range"
      min="0"
      max="1"
      step="any"
      class="absolute h-full w-full"
      bind:value={progress}
    />
  {/if}
</div>
