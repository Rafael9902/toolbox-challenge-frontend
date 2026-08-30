import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { loadFiles, selectFiles, selectSelectedFile } from '../files.slice.js'

/**
 * State of a request owned by the store.
 *
 * @typedef  {Object} AsyncState
 * @property {*}        data     Payload once it arrived, otherwise null.
 * @property {boolean}  loading  True while the request is in flight.
 * @property {string?}  error    User-facing message, otherwise null.
 * @property {Function} reload   Runs the request again.
 */

/**
 * Binds the files slice to the view: reads it with `useSelector` and asks for
 * the data once per attempt and per selected file with `useDispatch`.
 *
 * The filter is server side: selecting a file re-runs the effect, which asks
 * the API for that file instead of narrowing the payload in memory.
 *
 * It keeps no copy of the payload — `data`, `loading` and `error` are read
 * straight from the store on every render.
 *
 * @returns {AsyncState} `data` holds `FileData[]` once the request resolves.
 */
export const useFilesData = () => {
  const { data, loading, error } = useSelector(selectFiles)
  const selectedFile = useSelector(selectSelectedFile)
  const dispatch = useDispatch()
  const [attempt, setAttempt] = useState(0)

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    const request = dispatch(loadFiles(selectedFile))

    return () => request.abort()
  }, [dispatch, attempt, selectedFile])

  return { data, loading, error, reload }
}
