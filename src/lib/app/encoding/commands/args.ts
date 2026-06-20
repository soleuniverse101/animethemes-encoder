// TODO maybe add value to argsDef like for input but to others to allow duplicates with different semantics
const argsDefinition = {
  ffmpeg: [
    // Input
    { name: "ss", type: "option" },
    { name: "to", type: "option" },
    { name: "i", type: "option" },
    // Pass
    { name: "pass", type: "option" },
    { name: "passlogfile", type: "option" },
    // Video
    { name: "c:v", type: "option" },
    { name: "crf", type: "option" },
    { name: "b:v", type: "option" },
    { name: "qcomp", type: "option" },
    // Audio
    { name: "c:a", type: "option" },
    { name: "b:a", type: "option" },
    // Ignoring streams
    { name: "an", type: "flag" },
    { name: "sn", type: "flag" },
    // Filters
    { name: "af", type: "option" },
    { name: "vf", type: "option" },
    // Colorspace
    { name: "pix_fmt", type: "option" },
    { name: "colorspace", type: "option" },
    { name: "color_primaries", type: "option" },
    { name: "color_trc", type: "option" },
    // Processing, multithreading & parallelization
    { name: "cpu-used", type: "option" },
    { name: "g", type: "option" },
    { name: "threads", type: "option" },
    { name: "tile-columns", type: "option" },
    { name: "frame-parallel", type: "option" },
    { name: "auto-alt-ref", type: "option" },
    { name: "lag-in-frames", type: "option" },
    { name: "row-mt", type: "option" },
    // Metadata
    { name: "map_metadata", type: "option" },
    { name: "map_chapters", type: "option" },
    // Output
    { name: "f", type: "option" },
    { name: "output", type: "positional" },
    { name: "y", type: "flag" }
  ],
  ffprobe: [
    { name: "show_format", type: "flag" },
    { name: "show_streams", type: "flag" },
    { name: "output_format", type: "option" },
    { name: "input", type: "positional" }
  ]
} as const satisfies Record<string, { name: string; type: "option" | "flag" | "positional" }[]>;
// TODO change argsDefinition to object/map
{
  for (const args of Object.values(argsDefinition)) {
    const names: string[] = [];
    for (const { name } of args) {
      if (names.includes(name)) {
        throw new Error(`Duplicate argument found in argsDefinition "${name}"`);
      } else {
        names.push(name);
      }
    }
  }
}
type Args = typeof argsDefinition;

export type Program = keyof Args;
export namespace Args {
  export type Flag<P extends Program> = Extract<Args[P][number], { type: "flag" }>["name"];
  export type Option<P extends Program> = Extract<Args[P][number], { type: "option" }>["name"];
  export type Positional<P extends Program> = Extract<
    Args[P][number],
    { type: "positional" }
  >["name"];
}

export type Argument<P extends Program> = Readonly<
  | {
      type: "positional";
      name: Args.Positional<P>;
      value: string;
    }
  | {
      type: "flag";
      name: Args.Flag<P>;
    }
  | {
      type: "option";
      name: Args.Option<P>;
      value: string;
    }
>;

function argIndex<P extends Program>(program: P, name: Argument<P>["name"]) {
  return argsDefinition[program].findIndex(({ name: _name }) => _name == name);
}

// TODO unit tests
export function sortedArguments<P extends Program>(program: P, args: Argument<P>[]): Argument<P>[] {
  return args.toSorted(({ name: a }, { name: b }) => argIndex(program, a) - argIndex(program, b));
}
