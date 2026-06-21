/** Returns a promise and a callback. The promise resolves once the callback is called. */
export function createPromiseCallback(): [promise: Promise<void>, callback: () => void] {
  let called = false;
  let callback: () => void;
  return [
    new Promise((res) => {
      if (called) {
        res(undefined);
      } else {
        callback = () => res(undefined);
      }
    }),
    () => {
      called = true;
      if (callback) callback();
    }
  ];
}
