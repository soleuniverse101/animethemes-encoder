import type { TimePosition } from "$lib/mpv/types";

export namespace Format {
  const timecodeFormatter = new Intl.DurationFormat(undefined, {
    style: "digital",
    hoursDisplay: "auto"
  });

  /** NOT PRECISE! ROUNDS TO NEAREST MILLISECOND! */
  export function toTimecode(position: TimePosition) {
    return timecodeFormatter.format(
      Temporal.Duration.from({ milliseconds: Math.round(position * 1000) })
    );
  }
}
