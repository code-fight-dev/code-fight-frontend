export type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

export function createDeferred<T>(): Deferred<T> {
  let resolve: (value: T | PromiseLike<T>) => void = () => {
    throw new Error("Deferred resolver is not initialized");
  };
  let reject: (reason?: unknown) => void = () => {
    throw new Error("Deferred rejector is not initialized");
  };

  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return {
    promise,
    resolve,
    reject,
  };
}
