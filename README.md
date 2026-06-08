# AnimeThemes Encoder (non-official)

A helper tool to streamline the encoding process of AnimeThemes.moe

_This app is still under development and has no bundled release at the time._

## Development

The stack is basically Tauri with Rust as backend and Svelte as frontend (using SvelteKit and TypeScript)

### Setup instructions

- Install :
  - [pnpm](https://pnpm.io/installation)
  - [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/), which include [Rust](https://rust-lang.org/tools/install/)
- Clone this repository into a folder of your choosing

  ```sh
  git clone https://github.com/soleuniverse101/animethemes-encoder.git
  ```

- Install all dependencies with `pnpm`

  ```sh
  cd animethemes-encoder
  pnpm install
  ```

- Finally, run the app

  ```sh
  pnpm tauri dev
  ```

### Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

_`.vscode/extensions.json` should make VSCode suggest installing all these extensions at once_
