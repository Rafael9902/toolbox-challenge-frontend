import { useCallback, useEffect, useState } from 'react'

import * as filesApi from './files.api.js'

/**
 * @typedef  {Object} AsyncState
 * @property {*}        data     Payload once it arrived, otherwise null.
 * @property {boolean}  loading  True while the request is in flight.
 * @property {string?}  error    User-facing message, otherwise null.
 * @property {Function} reload   Runs the request again.
 */

/**
 * Loads the API health on mount.
 *
 * Owns the request lifecycle and exposes plain state: it renders nothing and
 * knows no JSX.
 *
 * @returns {AsyncState}
 */
export const useHealth = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError(null)

    filesApi
      .fetchHealth({ signal: controller.signal })
      .then((health) => setData(health))
      .catch((failure) => {
        // The abort is the cleanup of this very effect, not a failure.
        if (failure.name === 'AbortError') return
        setError(failure.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt])

  return { data, loading, error, reload }
}
