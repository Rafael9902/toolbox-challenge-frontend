/**
 * One row of the table: a line of a file, carrying the name of the file it
 * belongs to.
 *
 * @typedef  {Object} FileRow
 * @property {string} id      Stable identity of the row, used as the React key.
 * @property {string} file
 * @property {string} text
 * @property {number} number
 * @property {string} hex
 */

/**
 * Flattens the API response into the rows the table renders: one row per line,
 * with the file name repeated on each. A file whose `lines` came empty simply
 * contributes no rows.
 *
 * Pure: same input, same output, no side effects.
 *
 * @param {import('./files.api.js').FileData[]} files
 * @returns {FileRow[]}
 */
export const toFileRows = (files) =>
  files.flatMap(({ file, lines }) =>
    lines.map(({ text, number, hex }) => ({
      id: `${file}|${number}|${hex}`,
      file,
      text,
      number,
      hex
    }))
  )
