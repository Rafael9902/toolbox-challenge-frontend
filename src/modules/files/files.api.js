import { getJson } from '../../shared/http/httpClient.js'

/**
 * One parsed line of a file.
 *
 * @typedef  {Object} FileLine
 * @property {string} text
 * @property {number} number
 * @property {string} hex
 */

/**
 * A file with the lines the API could parse. `lines` comes empty when every
 * line of that file was discarded.
 *
 * @typedef  {Object} FileData
 * @property {string}     file
 * @property {FileLine[]} lines
 */

/**
 * @param {string} [fileName]  When given, asks the API for that file only.
 * @returns {string} Path of the data endpoint, with the filter as a query param.
 */
const dataPath = (fileName) =>
  fileName ? `/files/data?fileName=${encodeURIComponent(fileName)}` : '/files/data'

/**
 * @param {Object} [options]
 * @param {string} [options.fileName]  Narrows the response to a single file.
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<FileData[]>} The bare array the API answers, unwrapped.
 */
export const fetchFilesData = ({ fileName, signal } = {}) => getJson(dataPath(fileName), { signal })

/**
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<string[]>} Names of the files the API can serve, unwrapped
 *   from the `{ files }` envelope of the endpoint.
 */
export const fetchFileNames = async ({ signal } = {}) => {
  const { files } = await getJson('/files/list', { signal })

  return files || []
}
