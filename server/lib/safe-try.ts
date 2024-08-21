/**
 * Either type represents a data structure that encapsulates a successful result or an Error.
 * It wraps the result of a Promise in an object, making it easier to handle errors by returning
 * an object that either contains a 'result' value of type T (if successful), or an 'error' of type Error.
 *
 * @template T The type of the result value.
 */
export type Either<T> =
  | Promise<{
      error: Error;
      result: null;
    }>
  | Promise<{
      error: null;
      result: T;
    }>;

/**
 * Wraps a promise in an Either. This function takes a Promise of type T and returns a Promise
 * which resolves with an object that either contains a 'result' of type T, or an 'error' of type Error.
 *
 * @export
 * @template T The type of the result value.
 * @param {Promise<T>} promise The promise to be wrapped in an Either.
 * @return {Either<T>} A Promise that resolves with an Either.
 */
export async function safeTry<T>(promise: Promise<T>): Promise<Either<T>> {
  let result: T | null;

  try {
    result = await promise;

    return { error: null, result };
  } catch (error) {
    result = null;

    if (error instanceof Error) {
      return { error, result };
    }

    return { error: new Error("Unknown error"), result };
  }
}
