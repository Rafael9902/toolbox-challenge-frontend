import {
  fileSelected,
  filesReducer,
  loadFileNames,
  loadFiles,
  selectFileNames,
  selectFiles,
  selectSelectedFile
} from '../../src/modules/files/files.slice.js'

const FILES = [
  { file: 'test3.csv', lines: [{ text: 'g', number: 101382507, hex: '65badd1f29e6235199261cd3026a97f5' }] },
  { file: 'test1.csv', lines: [] }
]

const FILE_NAMES = ['test1.csv', 'test2.csv', 'test3.csv']

const INITIAL = { data: null, loading: true, error: null, fileNames: [], selectedFile: '' }

const REQUEST_ID = 'request-1'

/** The error the api layer throws, already translated for the user. */
const failure = () => new Error('The API is unreachable. Is it running?')

/** The error a cancelled request rejects with, so `meta.aborted` comes out true. */
const abortFailure = () => {
  const error = new Error('Aborted')
  error.name = 'AbortError'
  return error
}

/** State of the reducer after applying the actions in order. */
const stateAfter = (...actions) => actions.reduce(filesReducer, undefined)

describe('filesReducer', () => {
  it('starts loading, so the first render is a spinner and not an empty table', () => {
    expect(filesReducer(undefined, { type: '@@INIT' })).toEqual(INITIAL)
  })

  it('starts with no file selected, so the first request asks for every file', () => {
    expect(filesReducer(undefined, { type: '@@INIT' }).selectedFile).toBe('')
  })

  it('leaves the state untouched for an action it does not own', () => {
    const state = { ...INITIAL, data: FILES, loading: false }

    expect(filesReducer(state, { type: 'other/action' })).toBe(state)
  })

  describe('start', () => {
    it('turns the loading flag on', () => {
      const state = stateAfter(loadFiles.pending(REQUEST_ID))

      expect(state).toEqual({ ...INITIAL, loading: true })
    })

    it('clears the previous error, so a retry never shows the old failure', () => {
      const state = stateAfter(
        loadFiles.rejected(failure(), REQUEST_ID),
        loadFiles.pending(REQUEST_ID)
      )

      expect(state).toEqual({ ...INITIAL, loading: true, error: null })
    })

    it('keeps the data already on screen while the next request is in flight', () => {
      const state = stateAfter(
        loadFiles.fulfilled(FILES, REQUEST_ID),
        loadFiles.pending(REQUEST_ID)
      )

      expect(state).toEqual({ ...INITIAL, data: FILES, loading: true })
    })
  })

  describe('success', () => {
    it('stores the payload and turns the loading flag off', () => {
      const state = stateAfter(loadFiles.pending(REQUEST_ID), loadFiles.fulfilled(FILES, REQUEST_ID))

      expect(state).toEqual({ ...INITIAL, data: FILES, loading: false })
    })

    it('keeps the files whose lines came empty, instead of dropping them', () => {
      const empty = [{ file: 'test1.csv', lines: [] }]

      expect(stateAfter(loadFiles.fulfilled(empty, REQUEST_ID)).data).toEqual(empty)
    })

    it('replaces the previous payload instead of appending to it', () => {
      const state = stateAfter(
        loadFiles.fulfilled(FILES, REQUEST_ID),
        loadFiles.fulfilled([], REQUEST_ID)
      )

      expect(state.data).toEqual([])
    })
  })

  describe('error', () => {
    it('stores the message and turns the loading flag off', () => {
      const state = stateAfter(loadFiles.pending(REQUEST_ID), loadFiles.rejected(failure(), REQUEST_ID))

      expect(state).toEqual({
        ...INITIAL,
        loading: false,
        error: 'The API is unreachable. Is it running?'
      })
    })

    it('keeps the data already loaded when a later request fails', () => {
      const state = stateAfter(
        loadFiles.fulfilled(FILES, REQUEST_ID),
        loadFiles.rejected(failure(), REQUEST_ID)
      )

      expect(state).toEqual({ ...INITIAL, data: FILES, loading: false, error: expect.any(String) })
    })

    it('ignores the abort, which is the cleanup of the effect and not a failure', () => {
      const loading = stateAfter(loadFiles.pending(REQUEST_ID))
      const aborted = loadFiles.rejected(abortFailure(), REQUEST_ID)

      expect(aborted.meta.aborted).toBe(true)
      expect(filesReducer(loading, aborted)).toEqual({ ...INITIAL, loading: true })
    })
  })

  describe('file names', () => {
    it('stores the names the filter offers', () => {
      const state = stateAfter(loadFileNames.fulfilled(FILE_NAMES, REQUEST_ID))

      expect(state.fileNames).toEqual(FILE_NAMES)
    })

    it('leaves the names empty when the listing fails, which disables the filter', () => {
      const state = stateAfter(loadFileNames.rejected(failure(), REQUEST_ID))

      expect(state.fileNames).toEqual([])
    })

    it('never turns a failing listing into the error of the screen', () => {
      const state = stateAfter(
        loadFiles.fulfilled(FILES, REQUEST_ID),
        loadFileNames.rejected(failure(), REQUEST_ID)
      )

      expect(state).toEqual({ ...INITIAL, data: FILES, loading: false, error: null })
    })

    it('does not touch the data when the listing arrives', () => {
      const state = stateAfter(
        loadFiles.fulfilled(FILES, REQUEST_ID),
        loadFileNames.fulfilled(FILE_NAMES, REQUEST_ID)
      )

      expect(state.data).toEqual(FILES)
      expect(state.loading).toBe(false)
    })
  })

  describe('selection', () => {
    it('stores the file the user picked', () => {
      const state = stateAfter(fileSelected('test2.csv'))

      expect(state.selectedFile).toBe('test2.csv')
    })

    it('goes back to every file when the selection is cleared', () => {
      const state = stateAfter(fileSelected('test2.csv'), fileSelected(''))

      expect(state.selectedFile).toBe('')
    })

    it('keeps the names of the filter when the selection changes', () => {
      const state = stateAfter(loadFileNames.fulfilled(FILE_NAMES, REQUEST_ID), fileSelected('test2.csv'))

      expect(state.fileNames).toEqual(FILE_NAMES)
    })
  })

  describe('immutability', () => {
    const TRANSITIONS = [
      { name: 'start', action: () => loadFiles.pending(REQUEST_ID) },
      { name: 'success', action: () => loadFiles.fulfilled(FILES, REQUEST_ID) },
      { name: 'error', action: () => loadFiles.rejected(failure(), REQUEST_ID) },
      { name: 'file names', action: () => loadFileNames.fulfilled(FILE_NAMES, REQUEST_ID) },
      { name: 'selection', action: () => fileSelected('test2.csv') }
    ]

    it.each(TRANSITIONS)('returns a new state on $name, without touching the previous one', ({ action }) => {
      const previous = Object.freeze({ ...INITIAL, loading: false, error: 'Boom' })

      const next = filesReducer(previous, action())

      expect(next).not.toBe(previous)
      expect(previous).toEqual({ ...INITIAL, loading: false, error: 'Boom' })
    })
  })
})

describe('selectors', () => {
  const files = { ...INITIAL, data: FILES, loading: false, fileNames: FILE_NAMES, selectedFile: 'test3.csv' }

  it('selectFiles reads the slice the files feature owns', () => {
    expect(selectFiles({ files })).toBe(files)
  })

  it('selectFileNames reads the names the filter offers', () => {
    expect(selectFileNames({ files })).toEqual(FILE_NAMES)
  })

  it('selectSelectedFile reads the file the screen is narrowed to', () => {
    expect(selectSelectedFile({ files })).toBe('test3.csv')
  })
})
