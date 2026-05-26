export namespace FileUtils {
  export function extension(path: string) {
    return path.split(".").pop();
  }

  export function isVideoFile(path: string) {
    return [".mp4", ".mkv", ".avi", ".mov", ".flv", ".wmv", ".webm"].includes(
      (extension(path) ?? "").toLowerCase()
    );
  }
}
