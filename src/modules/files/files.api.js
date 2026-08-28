import { getJson } from '../../shared/http/httpClient.js'

/**
 * The only layer that talks to the API.
 *
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ status: string }>}
 */
export const fetchHealth = ({ signal } = {}) => getJson('/files/health', { signal })
