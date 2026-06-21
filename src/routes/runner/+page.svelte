<script lang="ts">
  import { JobRunner } from "$lib/app/runner/index.svelte";
  import type { RunJobPayload } from "$lib/app/runner/schedule";
  import JobRunnerControls from "$lib/components/runner/JobRunnerControls.svelte";
  import ConfirmationDialogButton from "$lib/components/ui/ConfirmationDialogButton.svelte";
  import Dialog from "$lib/components/ui/Dialog.svelte";
  import { waitForPayload } from "$lib/utils/tauri";
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { onDestroy } from "svelte";

  const runnerWindow = getCurrentWebviewWindow();
  const payload = waitForPayload<RunJobPayload>(runnerWindow, "run-job");
  await runnerWindow.emit("runner-ready");

  const { title, ...runnerInputs } = await payload;
  const runner = new JobRunner(runnerInputs);
  await runner.start();

  let closing = $state(false);
  let closeDialogOpen = $state(false);

  async function closeWindow() {
    closing = true;
    await runner.cancel();
    await runnerWindow.destroy();
  }

  const unlisten = await runnerWindow.onCloseRequested(async (event) => {
    if (runner.cancelled) {
      closing = true;
      return await runner.cancel();
    }
    event.preventDefault();
    if (!closing) {
      closeDialogOpen = true;
    }
  });

  // TODO review lifecycle (also lifecycle of all other components/pages)
  onDestroy(() => unlisten());
</script>

<main class="w-full grow p-2 flex flex-col">
  <h1 class="text-center mb-2">Job Runner</h1>
  <JobRunnerControls
    {title}
    cancelled={runner.cancelled}
    cancel={() => runner.cancel()}
    progress={runner.progress ?? 0}
    stderr={runner.stderr}
  />
  <ConfirmationDialogButton
    bind:open={closeDialogOpen}
    title="Job cancellation confirmation"
    description="Closing this window will cancel the current job running and cause it to output a shorter file. Are you sure you want to cancel this job ?"
    action={closeWindow}
  />
  <Dialog bind:open={closing} closeable={false}>
    Closing this window, please wait a few seconds for the current job to be cancelled.
  </Dialog>
</main>
