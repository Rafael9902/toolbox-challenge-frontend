import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fileSelected, loadFileNames, selectFileNames, selectSelectedFile } from '../files.slice.js'

/**
 * State of the file name filter.
 *
 * @typedef  {Object} FilterState
 * @property {string[]} fileNames     Names the API offers; empty while they are
 *   unknown, and also when the listing failed.
 * @property {string}   selectedFile  Empty string means every file.
 * @property {Function} selectFile    Narrows the screen to the name it receives.
 */

/**
 * Binds the file name filter to the store: asks for the listing once and
 * exposes the selection.
 *
 * A failing listing is not surfaced as an error — see `files.slice.js`.
 *
 * @returns {FilterState}
 */
export const useFileFilter = () => {
  const fileNames = useSelector(selectFileNames)
  const selectedFile = useSelector(selectSelectedFile)
  const dispatch = useDispatch()

  useEffect(() => {
    const request = dispatch(loadFileNames())

    return () => request.abort()
  }, [dispatch])

  const selectFile = useCallback((fileName) => dispatch(fileSelected(fileName)), [dispatch])

  return { fileNames, selectedFile, selectFile }
}
