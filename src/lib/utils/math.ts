// TODO replace with https://github.com/tc39/proposal-math-clamp
export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export namespace Nullable {
  type Value = number | undefined;
  type OperationResult<A extends Value, B extends Value> = A extends number
    ? B extends number
      ? number
      : null
    : null;

  export function div<A extends Value, B extends Value>(a: A, b: B): OperationResult<A, B> {
    if (a != null && b != null) {
      return (a / b) as OperationResult<A, B>;
    }
    return null as OperationResult<A, B>;
  }
}
