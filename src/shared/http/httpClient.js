import { config } from '../config.js'
import { createApiError, ERROR_CODES } from '../apiError.js'

/**
 * Reads JSON from the API, turning both transport and status failures into a
 * typed {@link createApiError}.
 *
 * @param {string} path  Path appended to the configured base URL.
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal]  Aborts the request.
 * @returns {Promise<*>} Parsed JSON body.
 * @throws {Error} ApiError with `NETWORK` or `BAD_RESPONSE`.
 */
export const getJson = async (path, { signal } = {}) => {
  let response

  try {
    response = await fetch(`${config.api.baseUrl}${path}`, { signal })
  } catch (cause) {
    if (cause.name === 'AbortError') throw cause
    throw createApiError({
      code: ERROR_CODES.NETWORK,
      message: 'The API is unreachable. Is it running?'
    })
  }

  if (!response.ok) {
    throw createApiError({
      code: ERROR_CODES.BAD_RESPONSE,
      message: `The API answered with status ${response.status}.`,
      status: response.status
    })
  }

  return response.json()
}
