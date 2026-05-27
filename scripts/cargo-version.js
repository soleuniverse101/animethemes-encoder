import { execSync } from "node:child_process";

const version = execSync("pnpm pkg get version").toString();
execSync("cargo bump --manifest-path src-tauri/Cargo.toml " + version);

console.log("Cargo.toml version bumped to " + version);
