import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { App } from '../../src/App.jsx'
import { createAppStore } from '../../src/store.js'

/** Mounts the app over its own store, the way `src/index.jsx` provides one. */
const renderApp = () =>
  render(
    <Provider store={createAppStore()}>
      <App />
    </Provider>
  )

/** Names the listing endpoint answers, so the filter has something to offer. */
const LISTING = { files: ['test1.csv', 'test3.csv', 'test2.csv', 'test9.csv'] }

/**
 * Builds a fetch double, so the test never touches the network.
 *
 * The filter asks for `/files/list` besides the data, so the double answers
 * that path on its own: a test states what the data endpoint returns and does
 * not have to mind the listing.
 */
const mockFetch = (impl) => {
  global.fetch = jest.fn((url, options) =>
    url.includes('/files/list')
      ? Promise.resolve({ ok: true, status: 200, json: async () => LISTING })
      : impl(url, options))
}

/** The calls the double received for the data endpoint, listing aside. */
const dataCalls = () => global.fetch.mock.calls.filter(([url]) => url.includes('/files/data'))

const respondWith = (body, { ok = true, status = 200 } = {}) =>
  () => Promise.resolve({ ok, status, json: async () => body })

/**
 * The contract of GET /files/data: a bare array, empty `lines` included.
 * Shaped like the live API, where most files arrive with no lines at all.
 */
const FILES = [
  { file: 'test1.csv', lines: [] },
  {
    file: 'test3.csv',
    lines: [
      { text: 'g', number: 101382507, hex: '65badd1f29e6235199261cd3026a97f5' },
      { text: 'mwmBQxoeKkxMm', number: 57685292, hex: 'cb6dfa6422d170d2ae99aaf3f99665e4' }
    ]
  },
  { file: 'test2.csv', lines: [] },
  {
    file: 'test9.csv',
    lines: [{ text: 'clnburZYpPQgBiveSSeq', number: 527447, hex: 'b57c543e4d1f0dab7d4353f9dd0db302' }]
  }
]

describe('App', () => {
  it('renders the shell with the application title', () => {
    mockFetch(() => new Promise(() => {}))

    renderApp()

    expect(document.querySelector('nav')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('mounts the features inside the centered content area', async () => {
    mockFetch(respondWith(FILES))

    renderApp()

    expect(screen.getByRole('main')).toContainElement(await screen.findByRole('table'))
  })

  it('asks the API for the files data once, without being told to', async () => {
    mockFetch(respondWith(FILES))

    renderApp()

    await screen.findByRole('table')
    expect(dataCalls()).toHaveLength(1)
    expect(dataCalls()[0][0]).toBe('http://localhost:3000/files/data')
  })

  it('shows a loading indicator while the API is being reached', () => {
    mockFetch(() => new Promise(() => {}))

    renderApp()

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows the files in a table once the request resolves', async () => {
    mockFetch(respondWith(FILES))

    renderApp()

    const table = await screen.findByRole('table')
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual([
      'File Name',
      'Text',
      'Number',
      'Hex'
    ])
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('flattens the lines of every file into rows of the same table', async () => {
    mockFetch(respondWith(FILES))

    renderApp()

    const table = await screen.findByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(4)
    expect(within(table).getAllByRole('cell', { name: 'test3.csv' })).toHaveLength(2)
    expect(within(table).getByRole('cell', { name: '65badd1f29e6235199261cd3026a97f5' })).toBeInTheDocument()
  })

  it('renders no row for the files that arrived without lines', async () => {
    mockFetch(respondWith(FILES))

    renderApp()

    // Scoped to the table: the names also appear as options of the filter.
    const table = await screen.findByRole('table')
    expect(within(table).queryByText('test1.csv')).not.toBeInTheDocument()
    expect(within(table).queryByText('test2.csv')).not.toBeInTheDocument()
  })

  it('shows an actionable error when the API is unreachable', async () => {
    mockFetch(() => Promise.reject(new TypeError('Failed to fetch')))

    renderApp()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/unreachable/i)
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('shows an error when the API answers a failing status', async () => {
    mockFetch(respondWith([], { ok: false, status: 502 }))

    renderApp()

    expect(await screen.findByRole('alert')).toHaveTextContent('502')
  })

  it('retries the request when the user presses retry', async () => {
    let attempt = 0
    mockFetch(() => (attempt++ === 0
      ? Promise.reject(new TypeError('Failed to fetch'))
      : Promise.resolve({ ok: true, status: 200, json: async () => FILES })))

    renderApp()
    await userEvent.click(await screen.findByRole('button', { name: /retry/i }))

    expect(await screen.findByRole('table')).toBeInTheDocument()
    await waitFor(() => expect(dataCalls()).toHaveLength(2))
  })

  it('shows the empty state when the API answers with no files', async () => {
    mockFetch(respondWith([]))

    renderApp()

    expect(await screen.findByText(/returned no file lines/i)).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
  })

  it('shows the empty state when every file arrived without lines', async () => {
    mockFetch(respondWith([{ file: 'test1.csv', lines: [] }, { file: 'test2.csv', lines: [] }]))

    renderApp()

    expect(await screen.findByText(/returned no file lines/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows the loading indicator again while the retry is in flight', async () => {
    let respond
    let attempt = 0
    mockFetch(() => (attempt++ === 0
      ? Promise.reject(new TypeError('Failed to fetch'))
      : new Promise((resolve) => { respond = resolve })))

    renderApp()
    await userEvent.click(await screen.findByRole('button', { name: /retry/i }))

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryAllByRole('alert')).toHaveLength(0)

    respond({ ok: true, status: 200, json: async () => FILES })
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('shows one state at a time as the request resolves', async () => {
    mockFetch(respondWith(FILES))

    renderApp()

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryAllByRole('table')).toHaveLength(0)

    expect(await screen.findByRole('table')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryAllByRole('alert')).toHaveLength(0)
  })

  it('never leaks the transport error to the user', async () => {
    mockFetch(() => Promise.reject(new TypeError('ECONNREFUSED 127.0.0.1:3000')))

    renderApp()

    const alert = await screen.findByRole('alert')
    expect(alert).not.toHaveTextContent('ECONNREFUSED')
  })

  describe('filtering by file name', () => {
    it('offers the names the listing endpoint answers', async () => {
      mockFetch(respondWith(FILES))

      renderApp()

      const filter = await screen.findByRole('combobox', { name: /filter by file name/i })
      expect(within(filter).getByRole('option', { name: 'All files' })).toBeInTheDocument()
      LISTING.files.forEach((name) => {
        expect(within(filter).getByRole('option', { name })).toBeInTheDocument()
      })
    })

    it('asks the API for that file only, narrowing server side', async () => {
      const ONLY_TEST3 = [FILES[1]]
      mockFetch((url) =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: async () => (url.includes('fileName=') ? ONLY_TEST3 : FILES)
        }))

      renderApp()
      await screen.findByRole('table')
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /filter by file name/i }),
        'test3.csv'
      )

      await waitFor(() =>
        expect(dataCalls().map(([url]) => url)).toContain(
          'http://localhost:3000/files/data?fileName=test3.csv'))
      const table = await screen.findByRole('table')
      expect(within(table).getAllByRole('row')).toHaveLength(3) // header + 2 lines
    })

    it('goes back to every file when the filter is cleared', async () => {
      mockFetch(respondWith(FILES))

      renderApp()
      await screen.findByRole('table')
      const filter = screen.getByRole('combobox', { name: /filter by file name/i })
      await userEvent.selectOptions(filter, 'test3.csv')
      await userEvent.selectOptions(filter, '')

      await waitFor(() =>
        expect(dataCalls().at(-1)[0]).toBe('http://localhost:3000/files/data'))
    })

    it('keeps working with the filter disabled when the listing fails', async () => {
      global.fetch = jest.fn((url) =>
        url.includes('/files/list')
          ? Promise.reject(new TypeError('Failed to fetch'))
          : Promise.resolve({ ok: true, status: 200, json: async () => FILES }))

      renderApp()

      expect(await screen.findByRole('table')).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /filter by file name/i })).toBeDisabled()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
