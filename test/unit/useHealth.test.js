import { renderHook, waitFor } from '@testing-library/react'

import { useHealth } from '../../src/modules/files/files.hooks.js'
import * as filesApi from '../../src/modules/files/files.api.js'

jest.mock('../../src/modules/files/files.api.js')

describe('useHealth', () => {
  it('starts in a loading state', () => {
    filesApi.fetchHealth.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useHealth())

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('exposes the payload once the request resolves', async () => {
    filesApi.fetchHealth.mockResolvedValue({ status: 'ok' })

    const { result } = renderHook(() => useHealth())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ status: 'ok' })
    expect(result.current.error).toBeNull()
  })

  it('exposes the error message when the request fails', async () => {
    filesApi.fetchHealth.mockRejectedValue(new Error('The API is unreachable. Is it running?'))

    const { result } = renderHook(() => useHealth())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('The API is unreachable. Is it running?')
    expect(result.current.data).toBeNull()
  })

  it('requests once per mount, not on every render', async () => {
    filesApi.fetchHealth.mockResolvedValue({ status: 'ok' })

    const { rerender, result } = renderHook(() => useHealth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    rerender()

    expect(filesApi.fetchHealth).toHaveBeenCalledTimes(1)
  })

  it('aborts the in-flight request when unmounted', () => {
    filesApi.fetchHealth.mockReturnValue(new Promise(() => {}))

    const { unmount } = renderHook(() => useHealth())
    const { signal } = filesApi.fetchHealth.mock.calls[0][0]
    unmount()

    expect(signal.aborted).toBe(true)
  })
})
