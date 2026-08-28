/**
 * Error codes surfaced by the API layer.
 *
 * @readonly
 * @enum {string}
 */
export const ERROR_CODES = Object.freeze({
  NETWORK: 'NETWORK',
  BAD_RESPONSE: 'BAD_RESPONSE'
})

/**
 * Creates a typed API error.
 *
 * @param {Object} params
 * @param {string} params.code      One of {@link ERROR_CODES}.
 * @param {string} params.message   Description safe to show to the user.
 * @param {number} [params.status]  HTTP status, when there was a response.
 * @returns {Error} Error with `name` set to `ApiError` plus the fields above.
 */
export const createApiError = ({ code, message, status }) => {
  const error = new Error(message)
  error.name = 'ApiError'
  error.code = code
  error.status = status
  return error
}
