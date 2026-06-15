import z from "zod";

export const emptyOptionsSchema = () => z.object({});

export const intString = z
  .string()
  .regex(z.regexes.integer)
  .transform((s) => parseInt(s));
