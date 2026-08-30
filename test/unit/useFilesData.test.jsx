import { act, renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import { useFilesData } from '../../src/modules/files/hooks/useFilesData.js'
import { loadFiles } from '../../src/modules/files/files.slice.js'
import * as filesApi from '../../src/modules/files/files.api.js'
import { createAppStore } from '../../src/store.js'

jest.mock('../../src/modules/files/files.api.js')

const FILES = [
  { file: 'test3.csv', lines: [{ text: 'g', number: 101382507, hex: '65badd1f29e6235199261cd3026a97f5' }] },
  { file: 'test1.csv', lines: [] }
]

/** Mounts the hook over its own store, the way the app provides one. */
const renderUseFilesData = () => {
  const store = createAppStore()
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>

  return { store, ...renderHook(() => useFilesData(), { wrapper }) }
}

describe('useFilesData', () => {
  it('starts in a loading state', () => {
    filesApi.fetchFilesData.mockReturnValue(new Promise(() => {}))

    const { result } = renderUseFilesData()

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('exposes the payload once the request resolves', async () => {
    filesApi.fetchFilesData.mockResolvedValue(FILES)

    const { result } = renderUseFilesData()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual(FILES)
    expect(result.current.error).toBeNull()
  })

  it('keeps the files whose lines came empty, instead of dropping them', async () => {
    filesApi.fetchFilesData.mockResolvedValue([{ file: 'test1.csv', lines: [] }])

    const { result } = renderUseFilesData()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([{ file: 'test1.csv', lines: [] }])
  })

  it('exposes the error message when the request fails', async () => {
    filesApi.fetchFilesData.mockRejectedValue(new Error('The API is unreachable. Is it running?'))

    const { result } = renderUseFilesData()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('The API is unreachable. Is it running?')
    expect(result.current.data).toBeNull()
  })

  it('requests once per mount, not on every render', async () => {
    filesApi.fetchFilesData.mockResolvedValue(FILES)

    const { rerender, result } = renderUseFilesData()
    await waitFor(() => expect(result.current.loading).toBe(false))
    rerender()

    expect(filesApi.fetchFilesData).toHaveBeenCalledTimes(1)
  })

  it('requests again and clears the previous error when reloaded', async () => {
    filesApi.fetchFilesData
      .mockRejectedValueOnce(new Error('The API is unreachable. Is it running?'))
      .mockResolvedValueOnce(FILES)

    const { result } = renderUseFilesData()
    await waitFor(() => expect(result.current.error).not.toBeNull())

    act(() => result.current.reload())

    await waitFor(() => expect(result.current.data).toEqual(FILES))
    expect(result.current.error).toBeNull()
    expect(filesApi.fetchFilesData).toHaveBeenCalledTimes(2)
  })

  it('aborts the in-flight request when unmounted', () => {
    filesApi.fetchFilesData.mockReturnValue(new Promise(() => {}))

    const { unmount } = renderUseFilesData()
    const { signal } = filesApi.fetchFilesData.mock.calls[0][0]
    unmount()

    expect(signal.aborted).toBe(true)
  })

  it('ignores the response that arrives after unmounting', async () => {
    let respond
    filesApi.fetchFilesData.mockReturnValue(new Promise((resolve) => { respond = resolve }))

    const { result, store, unmount } = renderUseFilesData()
    unmount()
    await act(async () => { respond(FILES) })

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(store.getState().files).toEqual({ data: null, loading: true, error: null })
  })

  it('reads the store instead of keeping a copy of the payload', async () => {
    filesApi.fetchFilesData.mockReturnValue(new Promise(() => {}))

    const { result, store } = renderUseFilesData()
    await act(async () => { store.dispatch(loadFiles.fulfilled(FILES, 'request-1')) })

    expect(result.current.data).toEqual(FILES)
    expect(result.current.loading).toBe(false)
  })
})
