declare let benzFrameNumber: number;

export function areInputsEqual(
  newInputs: readonly unknown[],
  lastInputs: readonly unknown[],
  memoizedFrameNumber: number,
  frameCountBuffer: number
): boolean {
  if (Math.abs(memoizedFrameNumber - benzFrameNumber) > frameCountBuffer) {
    return false;
  }

  // no checks needed if the inputs length has changed
  if (newInputs.length !== lastInputs.length) {
    return false;
  }

  for (let i = 0; i < newInputs.length; i++) {
    // using shallow equality check
    if (newInputs[i] !== lastInputs[i]) {
      return false;
    }
  }
  return true;
}
// Using ReadonlyArray<T> rather than readonly T as it works with TS v3
export type EqualityFn = (newArgs: any[], lastArgs: any[], frameNumber: number) => boolean;

function memoizeOne<
  // Need to use 'any' rather than 'unknown' here as it has
  // The correct Generic narrowing behaviour.
  ResultFn extends (this: any, ...newArgs: Vararg<any>) => ReturnType<ResultFn>
>(resultFn: ResultFn, frameCountBuffer: number = 4): ResultFn {
  let lastArgs: unknown[] = [];
  let lastResult: ReturnType<ResultFn>;
  let calledOnce: boolean = false;
  let lastFrame = -1;

  // breaking cache when context (this) or arguments change
  function memoized(this: unknown, ...newArgs: Vararg<any>): ReturnType<ResultFn> {
    if (calledOnce && areInputsEqual(newArgs, lastArgs, lastFrame, frameCountBuffer)) {
      return lastResult;
    }

    lastResult = resultFn(...newArgs);
    lastFrame = benzFrameNumber;
    calledOnce = true;
    lastArgs = newArgs;
    return lastResult;
  }

  return memoized as ResultFn;
}

// default export
export default memoizeOne;
// named export
export { memoizeOne };
