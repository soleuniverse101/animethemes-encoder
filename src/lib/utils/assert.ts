export function assertNonNull<T>(value: T | null | undefined, message?: string): NonNullable<T> {
  if (value == null) {
    throw new Error(message ?? "Null value");
  }
  return value;
}
