import { configureStore } from '@reduxjs/toolkit'

import { filesReducer } from './modules/files/index.js'

/**
 * Builds a store with one slice per feature.
 *
 * A factory instead of a shared instance: the app creates one at startup and
 * every test creates its own, so no state ever crosses between tests.
 *
 * @returns {import('@reduxjs/toolkit').EnhancedStore} Store with the `files` slice mounted.
 */
export const createAppStore = () =>
  configureStore({
    reducer: {
      files: filesReducer
    }
  })
