export function assertNonNull<T>(value: T | null | undefined): NonNullable<T> {
  if (value == null) {
    throw new Error("Null value");
  }
  return value;
}
