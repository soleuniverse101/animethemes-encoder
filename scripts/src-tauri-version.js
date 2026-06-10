import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const version = execSync("pnpm pkg get version").toString().trim();
const packageName = execSync("pnpm pkg get name").toString().trim();

writeFileSync(
  "src-tauri/tauri.conf.json",
  readFileSync("src-tauri/tauri.conf.json")
    .toString()
    .replace(/"version":\s*".+"/, `"version": "${version}"`)
);

execSync("cargo bump --manifest-path src-tauri/Cargo.toml " + version);
execSync("cargo update --manifest-path src-tauri/Cargo.toml " + packageName);

console.log("Cargo.toml version bumped to " + version);
