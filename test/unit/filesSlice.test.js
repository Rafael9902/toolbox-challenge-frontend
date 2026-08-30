import { filesReducer, loadFiles, selectFiles } from '../../src/modules/files/files.slice.js'

const FILES = [
  { file: 'test3.csv', lines: [{ text: 'g', number: 101382507, hex: '65badd1f29e6235199261cd3026a97f5' }] },
  { file: 'test1.csv', lines: [] }
]

const INITIAL = { data: null, loading: true, error: null }

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

  it('leaves the state untouched for an action it does not own', () => {
    const state = { data: FILES, loading: false, error: null }

    expect(filesReducer(state, { type: 'other/action' })).toBe(state)
  })

  describe('start', () => {
    it('turns the loading flag on', () => {
      const state = stateAfter(loadFiles.pending(REQUEST_ID))

      expect(state).toEqual({ data: null, loading: true, error: null })
    })

    it('clears the previous error, so a retry never shows the old failure', () => {
      const state = stateAfter(
        loadFiles.rejected(failure(), REQUEST_ID),
        loadFiles.pending(REQUEST_ID)
      )

      expect(state).toEqual({ data: null, loading: true, error: null })
    })

    it('keeps the data already on screen while the next request is in flight', () => {
      const state = stateAfter(
        loadFiles.fulfilled(FILES, REQUEST_ID),
        loadFiles.pending(REQUEST_ID)
      )

      expect(state).toEqual({ data: FILES, loading: true, error: null })
    })
  })

  describe('success', () => {
    it('stores the payload and turns the loading flag off', () => {
      const state = stateAfter(loadFiles.pending(REQUEST_ID), loadFiles.fulfilled(FILES, REQUEST_ID))

      expect(state).toEqual({ data: FILES, loading: false, error: null })
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
        data: null,
        loading: false,
        error: 'The API is unreachable. Is it running?'
      })
    })

    it('keeps the data already loaded when a later request fails', () => {
      const state = stateAfter(
        loadFiles.fulfilled(FILES, REQUEST_ID),
        loadFiles.rejected(failure(), REQUEST_ID)
      )

      expect(state).toEqual({ data: FILES, loading: false, error: expect.any(String) })
    })

    it('ignores the abort, which is the cleanup of the effect and not a failure', () => {
      const loading = stateAfter(loadFiles.pending(REQUEST_ID))
      const aborted = loadFiles.rejected(abortFailure(), REQUEST_ID)

      expect(aborted.meta.aborted).toBe(true)
      expect(filesReducer(loading, aborted)).toEqual({ data: null, loading: true, error: null })
    })
  })

  describe('immutability', () => {
    const TRANSITIONS = [
      { name: 'start', action: () => loadFiles.pending(REQUEST_ID) },
      { name: 'success', action: () => loadFiles.fulfilled(FILES, REQUEST_ID) },
      { name: 'error', action: () => loadFiles.rejected(failure(), REQUEST_ID) }
    ]

    it.each(TRANSITIONS)('returns a new state on $name, without touching the previous one', ({ action }) => {
      const previous = Object.freeze({ data: null, loading: false, error: 'Boom' })

      const next = filesReducer(previous, action())

      expect(next).not.toBe(previous)
      expect(previous).toEqual({ data: null, loading: false, error: 'Boom' })
    })
  })
})

describe('selectFiles', () => {
  it('reads the slice the files feature owns', () => {
    const files = { data: FILES, loading: false, error: null }

    expect(selectFiles({ files })).toBe(files)
  })
})
