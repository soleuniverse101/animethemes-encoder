export type Handler<H extends {} = {}> = Record<string, H | Function>;

type Flatten<H, Prefix extends string = ""> = {
  [K in keyof H]: H[K] extends Function
    ? {
        [P in Prefix extends "" ? K & string : `${Prefix}.${K & string}`]: H[K];
      }
    : H[K] extends Handler
      ? Flatten<H[K], Prefix extends "" ? K & string : `${Prefix}.${K & string}`>
      : never;
}[keyof H];

// Union -> Intersection
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;

type Simplify<T> = { [K in keyof T]: T[K] };

export type FlattenHandler<H extends Handler> = Simplify<UnionToIntersection<Flatten<H>>>;

export function flattenHandler<H extends Handler>(handler: H): FlattenHandler<H> {
  return Object.fromEntries(
    Object.entries(handler).flatMap(([path, value]) =>
      typeof value == "function"
        ? [[path, value]]
        : Object.entries(flattenHandler(value)).map(([subPath, subValue]) => [
            `${path}.${subPath}`,
            subValue
          ])
    )
  ) as FlattenHandler<H>;
}
