<script lang="ts">
  import { Progress, useId } from "bits-ui";

  interface Props {
    /** Value between 0 and 1 */
    value: number;
    label: string;
    class?: string;
  }

  const { value = 0, label, class: _class }: Props = $props();

  const percentage = $derived(value * 100);
  const valueLabel = $derived(`${percentage.toFixed(2)}%`);

  const labelId = useId();
</script>

<div class={[_class, "pt-1 p-2 flex flex-col gap-1"]}>
  <div class="flex justify-between">
    <span id={labelId}> {label} </span>
    <span>{valueLabel}</span>
  </div>
  <Progress.Root
    aria-labelledby={labelId}
    aria-valuetext={valueLabel}
    min={0}
    max={100}
    class="h-2 rounded-full bg-primary-300"
  >
    <div
      class="h-full bg-primary-600 rounded-full"
      style:width={`${percentage}%`}
    ></div></Progress.Root
  >
</div>
