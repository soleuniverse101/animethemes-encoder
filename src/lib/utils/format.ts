import type { TimePosition } from "$lib/mpv/types";
import prettyMilliseconds from "pretty-ms";

export namespace Format {
  /** NOT PRECISE! ROUNDS TO NEAREST MILLISECOND! */
  export const toTimecode = (position: TimePosition) =>
    prettyMilliseconds(Math.round(position * 1000), {
      colonNotation: true,
      keepDecimalsOnWholeSeconds: true,
      secondsDecimalDigits: 3
    });

  /** Example of result : 15 days 11 hours 1 minute 9 seconds. */
  export const toReadable = (position: TimePosition) =>
    prettyMilliseconds(Math.round(position * 1000), { verbose: true });
}
