# animethemes-encoder

## 0.1.5

### Patch Changes

- dd8df41: test updater

## 0.1.4

### Patch Changes

- 8579517: Added automatic updates sourced from GitHub repository

## 0.1.3

### Patch Changes

- 342c57a: Added tray icon. Click to show/hide app
- 270639d: Fixed error on info for unhandled streams (currently not displaying them)
- ec5ffe5: Added job runner
- e8c6636: Added automated releases for Windows
- 4c98922: Added jobs manager menu with ability to add/rename/remove jobs
- 7df2d50: Jobs can be easily cancelled by the user after confirming what it entails in a dialog before closing a runner window

## 0.1.2

### Patch Changes

- 3100768: Added audio & video filters system with audio normalization and fadeIn/Out
- cafdd43: Added profiles system to set default/user-defined options for encoding. Note that currently, a profile option isn't a one-to-one equivalent of an ffmpeg option/argument.
- 656cb27: Added basic video file info tab
- 656cb27: Added major video filters
- 896a93f: Added info tab entries to match check page "Things to do before encoding" section "Verifying the Source". (Not yet : automatic validation of some properties)
- 7ed1aa4: Added looping behavior on job bounds

## 0.1.1

### Patch Changes

- 8ef5518: Added basic styling with AnimeThemes.moe colors
- 20b150b: Added basic export capabality through command
- 0ae3244: Added basic playback with mpv by invoking libmpv in a new window and aligning it with the app's primary window.
- 65a47bf: Added timeline with multiple bounds selection with looping on the current bound
