import z from "zod";

export type FilterOptionInfo = { title: string };
export const schemaInfo = z.registry<FilterOptionInfo>();
