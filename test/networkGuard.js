/**
 * Builds the `fetch` every test starts with: one that refuses to run.
 *
 * Mocking `fetch` test by test is a convention, and a convention is not a
 * guarantee. Two holes it leaves open:
 *
 * - `clearMocks` clears the calls of a mock, not its implementation, so a test
 *   that forgets to mock silently inherits the response the previous test of
 *   the same file installed, and passes for the wrong reason.
 * - An unmocked `fetch` is `undefined` under jsdom, and `getJson` turns any
 *   transport failure into "The API is unreachable", so throwing is not enough
 *   either: the client swallows the throw and the test still passes.
 *
 * Hence the two halves. The double throws, so nothing gets a body it did not
 * ask for; and it records the attempt, so `assertUntouched` can fail the test
 * afterwards even when the code under test caught the throw.
 *
 * @returns {{fetch: jest.Mock, assertUntouched: () => void}}
 */
export const createNetworkGuard = () => {
  const attempts = []

  const fetch = jest.fn((input) => {
    attempts.push(String(input))
    throw new Error(`Blocked a real HTTP request to ${input}. Mock global.fetch in the test.`)
  })

  /** @throws {Error} If the double was called at all. */
  const assertUntouched = () => {
    if (attempts.length === 0) return

    throw new Error(
      `The test reached the network instead of a double: ${attempts.join(', ')}. ` +
        'Assign global.fetch, or mock the api module, before the request is made.'
    )
  }

  return { fetch, assertUntouched }
}
