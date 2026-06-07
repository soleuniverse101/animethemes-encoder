// TODO generalize HandlerFlatten into Flatten and put here

// TODO replace with this wherever you can in in job.svelte.ts & filter.svelte.ts
export type PrefixKeys<O extends Record<string, unknown>, Prefix extends string> = {
  [Key in keyof O as Key extends string ? `${Prefix}.${Key}` : never]: O[Key];
};
