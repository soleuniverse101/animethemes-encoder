import { open } from "@tauri-apps/plugin-dialog";

export namespace FileUtils {
  function extension(path: string) {
    return path.split(".").pop();
  }

  export function isVideoFile(path: string) {
    return [".mp4", ".mkv", ".avi", ".mov", ".flv", ".wmv", ".webm"].includes(
      (extension(path) ?? "").toLowerCase()
    );
  }

  export async function promptVideoFile(): Promise<string> {
    const file = await open({ multiple: false, title: "Upload source file" });
    if (file == null) {
      throw new Error(`File not found (${file})`);
    } else if (FileUtils.isVideoFile(file)) {
      throw new Error(`Incorrect extension for video file (${file})`);
    }
    return file;
  }
}
