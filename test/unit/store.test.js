import { createAppStore } from '../../src/store.js'
import { loadFiles } from '../../src/modules/files/files.slice.js'

describe('createAppStore', () => {
  it('mounts the files slice under its own key', () => {
    expect(createAppStore().getState()).toEqual({
      files: { data: null, loading: true, error: null }
    })
  })

  it('routes the actions of the feature to its reducer', () => {
    const store = createAppStore()

    store.dispatch(loadFiles.fulfilled([{ file: 'test1.csv', lines: [] }], 'request-1'))

    expect(store.getState().files.loading).toBe(false)
  })

  it('builds independent stores, so no state crosses between two of them', () => {
    const store = createAppStore()
    const other = createAppStore()

    store.dispatch(loadFiles.fulfilled([], 'request-1'))

    expect(other.getState().files).toEqual({ data: null, loading: true, error: null })
  })
})
