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
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<FileData[]>} The bare array the API answers, unwrapped.
 */
export const fetchFilesData = ({ signal } = {}) => getJson('/files/data', { signal })
