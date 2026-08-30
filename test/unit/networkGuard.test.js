import { createNetworkGuard } from '../networkGuard.js'
import { getJson } from '../../src/shared/http/httpClient.js'

describe('createNetworkGuard', () => {
  it('refuses the request instead of answering it', () => {
    const { fetch } = createNetworkGuard()

    expect(() => fetch('http://localhost:3000/files/data')).toThrow(/Blocked a real HTTP request/)
  })

  it('names the URL that was attempted, so the offending call is findable', () => {
    const { fetch } = createNetworkGuard()

    expect(() => fetch('http://localhost:3000/files/data')).toThrow(/files\/data/)
  })

  it('stays quiet when nothing tried to reach the network', () => {
    const { assertUntouched } = createNetworkGuard()

    expect(assertUntouched).not.toThrow()
  })

  it('reports the attempt afterwards, even when the caller swallowed the throw', () => {
    const { fetch, assertUntouched } = createNetworkGuard()

    try {
      fetch('http://localhost:3000/files/data')
    } catch (ignored) {
      // Exactly what getJson does with a transport failure.
    }

    expect(assertUntouched).toThrow(/reached the network/)
  })

  it('catches the client that turns the block into a friendly error', async () => {
    const guard = createNetworkGuard()
    global.fetch = guard.fetch

    // getJson rewrites every transport failure, so throwing alone would let an
    // unmocked test pass as if the API were merely down.
    await expect(getJson('/files/data')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'The API is unreachable. Is it running?'
    })
    expect(guard.assertUntouched).toThrow(/files\/data/)
  })
})

// The leak this guard closes only shows across a test boundary, so these two
// run as a sequence: the first installs a double, the second checks it is gone.
describe('the guard installed by test/setup.js', () => {
  let leftBehind

  it('hands every test a fetch double it never had to install', () => {
    expect(jest.isMockFunction(global.fetch)).toBe(true)

    leftBehind = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] })
    global.fetch = leftBehind
  })

  it('does not let the previous test decide the response of this one', () => {
    expect(global.fetch).not.toBe(leftBehind)
    expect(global.fetch.mock.calls).toHaveLength(0)
  })
})
