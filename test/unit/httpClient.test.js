import { getJson } from '../../src/shared/http/httpClient.js'
import { ERROR_CODES } from '../../src/shared/apiError.js'

describe('getJson', () => {
  it('returns the parsed body on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok' })
    })

    await expect(getJson('/files/health')).resolves.toEqual({ status: 'ok' })
  })

  it('calls the configured base URL', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) })

    await getJson('/files/health')

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/files/health',
      expect.any(Object)
    )
  })

  it('turns a non-ok status into a typed BAD_RESPONSE error', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({}) })

    await expect(getJson('/files/data')).rejects.toMatchObject({
      name: 'ApiError',
      code: ERROR_CODES.BAD_RESPONSE,
      status: 502
    })
  })

  it('turns a transport failure into a typed NETWORK error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(getJson('/files/data')).rejects.toMatchObject({
      name: 'ApiError',
      code: ERROR_CODES.NETWORK
    })
  })

  it('never exposes the transport message to the user', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('ECONNREFUSED 127.0.0.1:3000'))

    await expect(getJson('/files/data')).rejects.not.toMatchObject({
      message: expect.stringContaining('ECONNREFUSED')
    })
  })

  it('lets an abort propagate untouched, since it is not a failure', async () => {
    const aborted = new Error('aborted')
    aborted.name = 'AbortError'
    global.fetch = jest.fn().mockRejectedValue(aborted)

    await expect(getJson('/files/data')).rejects.toMatchObject({ name: 'AbortError' })
  })
})
