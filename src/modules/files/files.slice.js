import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import * as filesApi from './files.api.js'

/**
 * Slice of the global state owned by the files feature.
 *
 * @typedef  {Object} FilesState
 * @property {import('./files.api.js').FileData[]?} data     Payload once it arrived, otherwise null.
 * @property {boolean}  loading       True while a request is in flight.
 * @property {string?}  error         User-facing message, otherwise null.
 * @property {string[]} fileNames     Names offered by the filter; empty while they are unknown.
 * @property {string}   selectedFile  File the data is narrowed to; empty string means every file.
 */

/** @type {FilesState} */
const initialState = {
  data: null,
  loading: true,
  error: null,
  fileNames: [],
  selectedFile: ''
}

/**
 * Asks the API for the files data, narrowed to `fileName` when there is one.
 * Dispatches `pending` when it starts and `fulfilled` or `rejected` when it
 * settles.
 *
 * The `signal` comes from the thunk itself: calling `.abort()` on the promise
 * this returns cancels the request in flight.
 *
 * @type {import('@reduxjs/toolkit').AsyncThunk<import('./files.api.js').FileData[], string|void, {}>}
 */
export const loadFiles = createAsyncThunk('files/load', (fileName, { signal }) =>
  filesApi.fetchFilesData({ fileName, signal })
)

/**
 * Asks the API for the names the filter offers.
 *
 * A failure has no reducer on purpose: the list is an accessory of the screen,
 * so when it does not arrive `fileNames` stays empty, the filter renders
 * disabled and the data of every file keeps showing.
 *
 * @type {import('@reduxjs/toolkit').AsyncThunk<string[], void, {}>}
 */
export const loadFileNames = createAsyncThunk('files/loadNames', (_, { signal }) =>
  filesApi.fetchFileNames({ signal })
)

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    /**
     * Narrows the screen to one file, or back to every file with an empty name.
     *
     * @param {FilesState} state
     * @param {{ payload: string }} action
     */
    fileSelected: (state, action) => {
      state.selectedFile = action.payload
    }
  },
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
      .addCase(loadFileNames.fulfilled, (state, action) => {
        state.fileNames = action.payload
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

export const { fileSelected } = filesSlice.actions

/**
 * @param {{ files: FilesState }} state
 * @returns {FilesState} The whole slice, so the shape the page reads stays in
 *   one place.
 */
export const selectFiles = (state) => state.files

/**
 * @param {{ files: FilesState }} state
 * @returns {string[]} Names the filter offers.
 */
export const selectFileNames = (state) => state.files.fileNames

/**
 * @param {{ files: FilesState }} state
 * @returns {string} File the data is narrowed to; empty string means every file.
 */
export const selectSelectedFile = (state) => state.files.selectedFile
