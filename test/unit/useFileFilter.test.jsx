import { act, renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import { useFileFilter } from '../../src/modules/files/hooks/useFileFilter.js'
import * as filesApi from '../../src/modules/files/files.api.js'
import { createAppStore } from '../../src/store.js'

jest.mock('../../src/modules/files/files.api.js')

const FILE_NAMES = ['test1.csv', 'test2.csv', 'test3.csv']

/** Mounts the hook over its own store, the way the app provides one. */
const renderUseFileFilter = () => {
  const store = createAppStore()
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>

  return { store, ...renderHook(() => useFileFilter(), { wrapper }) }
}

describe('useFileFilter', () => {
  it('starts with no name to offer and no file selected', () => {
    filesApi.fetchFileNames.mockReturnValue(new Promise(() => {}))

    const { result } = renderUseFileFilter()

    expect(result.current.fileNames).toEqual([])
    expect(result.current.selectedFile).toBe('')
  })

  it('exposes the names once the listing resolves', async () => {
    filesApi.fetchFileNames.mockResolvedValue(FILE_NAMES)

    const { result } = renderUseFileFilter()

    await waitFor(() => expect(result.current.fileNames).toEqual(FILE_NAMES))
  })

  it('asks for the listing once per mount, not on every render', async () => {
    filesApi.fetchFileNames.mockResolvedValue(FILE_NAMES)

    const { rerender, result } = renderUseFileFilter()
    await waitFor(() => expect(result.current.fileNames).toEqual(FILE_NAMES))
    rerender()

    expect(filesApi.fetchFileNames).toHaveBeenCalledTimes(1)
  })

  it('keeps no name to offer when the listing fails, so the filter stays disabled', async () => {
    filesApi.fetchFileNames.mockRejectedValue(new Error('The API is unreachable. Is it running?'))

    const { result, store } = renderUseFileFilter()

    await waitFor(() => expect(filesApi.fetchFileNames).toHaveBeenCalledTimes(1))
    expect(result.current.fileNames).toEqual([])
    expect(store.getState().files.error).toBeNull()
  })

  it('stores the selection in the store, not in the hook', async () => {
    filesApi.fetchFileNames.mockResolvedValue(FILE_NAMES)

    const { result, store } = renderUseFileFilter()
    await act(async () => { result.current.selectFile('test2.csv') })

    expect(result.current.selectedFile).toBe('test2.csv')
    expect(store.getState().files.selectedFile).toBe('test2.csv')
  })

  it('clears the selection when it receives an empty name', async () => {
    filesApi.fetchFileNames.mockResolvedValue(FILE_NAMES)

    const { result } = renderUseFileFilter()
    await act(async () => { result.current.selectFile('test2.csv') })
    await act(async () => { result.current.selectFile('') })

    expect(result.current.selectedFile).toBe('')
  })

  it('does not ask for the listing again when the selection changes', async () => {
    filesApi.fetchFileNames.mockResolvedValue(FILE_NAMES)

    const { result } = renderUseFileFilter()
    await act(async () => { result.current.selectFile('test2.csv') })

    expect(filesApi.fetchFileNames).toHaveBeenCalledTimes(1)
  })

  it('aborts the in-flight listing when unmounted', () => {
    filesApi.fetchFileNames.mockReturnValue(new Promise(() => {}))

    const { unmount } = renderUseFileFilter()
    const { signal } = filesApi.fetchFileNames.mock.calls[0][0]
    unmount()

    expect(signal.aborted).toBe(true)
  })
})
