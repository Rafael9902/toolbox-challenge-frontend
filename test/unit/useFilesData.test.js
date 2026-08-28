import { act, renderHook, waitFor } from '@testing-library/react'

import { useFilesData } from '../../src/modules/files/hooks/useFilesData.js'
import * as filesApi from '../../src/modules/files/files.api.js'

jest.mock('../../src/modules/files/files.api.js')

const FILES = [
  { file: 'test3.csv', lines: [{ text: 'g', number: 101382507, hex: '65badd1f29e6235199261cd3026a97f5' }] },
  { file: 'test1.csv', lines: [] }
]

describe('useFilesData', () => {
  it('starts in a loading state', () => {
    filesApi.fetchFilesData.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useFilesData())

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('exposes the payload once the request resolves', async () => {
    filesApi.fetchFilesData.mockResolvedValue(FILES)

    const { result } = renderHook(() => useFilesData())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual(FILES)
    expect(result.current.error).toBeNull()
  })

  it('keeps the files whose lines came empty, instead of dropping them', async () => {
    filesApi.fetchFilesData.mockResolvedValue([{ file: 'test1.csv', lines: [] }])

    const { result } = renderHook(() => useFilesData())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([{ file: 'test1.csv', lines: [] }])
  })

  it('exposes the error message when the request fails', async () => {
    filesApi.fetchFilesData.mockRejectedValue(new Error('The API is unreachable. Is it running?'))

    const { result } = renderHook(() => useFilesData())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('The API is unreachable. Is it running?')
    expect(result.current.data).toBeNull()
  })

  it('requests once per mount, not on every render', async () => {
    filesApi.fetchFilesData.mockResolvedValue(FILES)

    const { rerender, result } = renderHook(() => useFilesData())
    await waitFor(() => expect(result.current.loading).toBe(false))
    rerender()

    expect(filesApi.fetchFilesData).toHaveBeenCalledTimes(1)
  })

  it('requests again and clears the previous error when reloaded', async () => {
    filesApi.fetchFilesData
      .mockRejectedValueOnce(new Error('The API is unreachable. Is it running?'))
      .mockResolvedValueOnce(FILES)

    const { result } = renderHook(() => useFilesData())
    await waitFor(() => expect(result.current.error).not.toBeNull())

    act(() => result.current.reload())

    await waitFor(() => expect(result.current.data).toEqual(FILES))
    expect(result.current.error).toBeNull()
    expect(filesApi.fetchFilesData).toHaveBeenCalledTimes(2)
  })

  it('aborts the in-flight request when unmounted', () => {
    filesApi.fetchFilesData.mockReturnValue(new Promise(() => {}))

    const { unmount } = renderHook(() => useFilesData())
    const { signal } = filesApi.fetchFilesData.mock.calls[0][0]
    unmount()

    expect(signal.aborted).toBe(true)
  })

  it('ignores the response that arrives after unmounting', async () => {
    let respond
    filesApi.fetchFilesData.mockReturnValue(new Promise((resolve) => { respond = resolve }))

    const { result, unmount } = renderHook(() => useFilesData())
    unmount()
    await act(async () => { respond(FILES) })

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(true)
  })
})
