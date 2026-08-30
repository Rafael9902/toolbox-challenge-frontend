import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import * as filesApi from './files.api.js'

/**
 * Slice of the global state owned by the files feature.
 *
 * @typedef  {Object} FilesState
 * @property {import('./files.api.js').FileData[]?} data     Payload once it arrived, otherwise null.
 * @property {boolean} loading  True while a request is in flight.
 * @property {string?} error    User-facing message, otherwise null.
 */

/** @type {FilesState} */
const initialState = {
  data: null,
  loading: true,
  error: null
}

/**
 * Asks the API for the files data. Dispatches `pending` when it starts and
 * `fulfilled` or `rejected` when it settles.
 *
 * The `signal` comes from the thunk itself: calling `.abort()` on the promise
 * this returns cancels the request in flight.
 *
 * @type {import('@reduxjs/toolkit').AsyncThunk<import('./files.api.js').FileData[], void, {}>}
 */
export const loadFiles = createAsyncThunk('files/load', (_, { signal }) =>
  filesApi.fetchFilesData({ signal })
)

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadFiles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadFiles.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(loadFiles.rejected, (state, action) => {
        // The abort is the cleanup of the effect that started the request, not
        // a failure: the state has to stay as the next request will find it.
        if (action.meta.aborted) return
        state.loading = false
        state.error = action.error.message
      })
  }
})

/**
 * Reducer of the files slice. Written with the Immer drafts of Redux Toolkit:
 * the assignments look like mutations and produce a new state object.
 *
 * @type {import('redux').Reducer<FilesState>}
 */
export const filesReducer = filesSlice.reducer

/**
 * @param {{ files: FilesState }} state
 * @returns {FilesState} The whole slice, so the shape the page reads stays in
 *   one place.
 */
export const selectFiles = (state) => state.files
