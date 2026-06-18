import type { TimePosition } from "$lib/mpv/types";
import { SvelteMap } from "svelte/reactivity";
import { JobFilters } from "./job-filters";

export namespace Job {
  // TODO validate label to match legal filenames
  export type Label = string;
  // TODO should "ready" state be stored to replace Infinite end bound ?
  export type Bounds = { start: TimePosition; end: TimePosition };
}

export interface Job {
  label: Job.Label;
  bounds: Job.Bounds;
  filters: JobFilters;
}

type JobCreateParams =
  | Job.Label
  | {
      label: Job.Label;
      start?: number;
      end?: number;
    };

const createJob = (params: JobCreateParams): Job => {
  let label: Job.Label;
  let bounds: Job.Bounds;
  if (typeof params == "string") {
    label = params;
    bounds = { start: 0, end: Number.POSITIVE_INFINITY };
  } else {
    label = params.label;
    bounds = {
      start: params.start ?? 0,
      end: params.end ?? Number.POSITIVE_INFINITY
    };
  }

  const job = $state({
    label,
    bounds,
    // TODO move in JobFilters ?
    filters: Object.fromEntries([
      ...JobFilters.requiredFiltersIds.all.map((id) => [id, JobFilters.create(id)])
    ])
  } satisfies Job);
  return job;
};

const paramsLabel = (params: JobCreateParams): Job.Label =>
  typeof params == "string" ? params : params.label;

export class Jobs {
  /** Don't edit manually. */
  readonly map: SvelteMap<Job.Label, Job> = new SvelteMap();
  readonly list: Job[];
  readonly single: boolean;

  constructor(jobsParams: JobCreateParams[], defaultJob?: Job.Label) {
    if (jobsParams.length == 0) {
      throw new Error("Cannot create empty jobs container");
    }
    const jobs = jobsParams.map(createJob);
    for (const job of jobs) {
      if (this.map.has(job.label)) {
        throw new Error(`Cannot create jobs container, duplicate label "${job.label}"`);
      }
      this.map.set(job.label, job);
    }
    this.list = $state(jobs);
    this.single = $derived(this.list.length == 0);
  }

  addJob(params: JobCreateParams): Job {
    const label = paramsLabel(params);
    if (this.map.has(label)) {
      throw new Error(`Cannot add job, label "${label}" already in use`);
    }
    const job = createJob(params);
    this.list.push(job);
    return job;
  }

  renameJob(label: Job.Label, newLabel: Job.Label) {
    const job = this.map.get(label);
    if (!job) {
      throw new Error(`Cannot rename job, label "${label}" not found`);
    } else if (newLabel == label) {
      throw new Error(`Cannot rename job with same label "${label}" as itself`);
    } else if (this.map.has(newLabel)) {
      throw new Error(`Cannot rename job, label "${newLabel}" already exists`);
    }
    this.map.delete(label);
    job.label = newLabel;
    this.map.set(label, job);
  }

  removeJob(label: Job.Label) {
    if (!this.map.has(label)) {
      throw new Error(`Cannot remove job, label "${label}" not found`);
    } else if (this.single) {
      throw new Error("Cannot remove single job");
    }
    this.map.delete(label);
    this.list.splice(
      this.list.findIndex(({ label: _label }) => _label == label),
      1
    );
  }
}
