import '@testing-library/jest-dom'

import { createNetworkGuard } from './networkGuard.js'

let guard

// Every test starts with a fetch that refuses to run, so "no real HTTP" stops
// being a convention each test has to remember and becomes a property of the
// suite. A test that needs a response installs its own double on top.
beforeEach(() => {
  guard = createNetworkGuard()
  global.fetch = guard.fetch
})

afterEach(() => {
  guard.assertUntouched()
})
