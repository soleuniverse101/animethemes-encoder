// TODO replace with https://github.com/tc39/proposal-math-clamp
export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
