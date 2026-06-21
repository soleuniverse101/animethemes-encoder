import { assertNonNull } from "$lib/utils/assert";
import type { FileInfo, StreamInfo } from "./info";

export function formatFramerate(framerate: StreamInfo<"video">["r_frame_rate"]) {
  const parts = framerate.split("/").map((n) => parseInt(n));
  return `${(parts[0] / parts[1]).toFixed(3)} FPS (${framerate})`;
}

export function findFramerate(streams: FileInfo["streams"]) {
  return assertNonNull(
    Iterator.from(streams)
      .filter((rawStream) => rawStream.type == "video")
      .map(({ stream }) => stream.r_frame_rate)
      .next().value,
    "Couldn't find framerate"
  );
}
