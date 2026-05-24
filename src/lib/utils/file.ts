export namespace FileUtils {
  export function extension(path: string) {
    return path.split(".").pop();
  }
}
