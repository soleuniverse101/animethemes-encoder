<script lang="ts">
  import type { StreamInfo } from "$lib/app/encoding/source/info";

  interface Props {
    info: NonNullable<StreamInfo>;
  }

  let { info }: Props = $props();
</script>

<table>
  <thead>
    <tr>
      <th>Stream {info.index} ({info.codec_type})</th>
    </tr>
  </thead>
  <tbody>
    <tr
      ><td>Codec</td>
      <td>{info.codec_long_name} ({info.codec_name})</td></tr
    >
  </tbody>
</table>
