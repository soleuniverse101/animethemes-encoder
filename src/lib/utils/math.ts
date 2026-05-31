// TODO replace with https://github.com/tc39/proposal-math-clamp
export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export namespace Nullable {
  type Value = number | null | undefined;
  type SingleOperationResult<V extends Value> = V extends number ? number : null;
  type BinaryOperationResult<A extends Value, B extends Value> = A extends number
    ? B extends number
      ? number
      : null
    : null;

  export function div<A extends Value, B extends Value>(a: A, b: B): BinaryOperationResult<A, B> {
    if (a != null && b != null) {
      return (a / b) as BinaryOperationResult<A, B>;
    }
    return null as BinaryOperationResult<A, B>;
  }

  export function round<V extends Value>(value: V): SingleOperationResult<V> {
    return (value == null ? null : Math.round(value)) as SingleOperationResult<V>;
  }
}
