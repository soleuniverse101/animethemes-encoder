import { execSync } from "node:child_process";

const version = execSync("pnpm pkg get version").toString();
const packageName = execSync("pnpm pkg get name").toString();
execSync("cargo bump --manifest-path src-tauri/Cargo.toml " + version);
execSync("cargo update --manifest-path src-tauri/Cargo.toml " + packageName);

console.log("Cargo.toml version bumped to " + version);
