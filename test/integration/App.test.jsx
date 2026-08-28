import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { App } from '../../src/App.jsx'

/** Builds a fetch double, so the test never touches the network. */
const mockFetch = (impl) => {
  global.fetch = jest.fn(impl)
}

const respondWith = (body, { ok = true, status = 200 } = {}) =>
  () => Promise.resolve({ ok, status, json: async () => body })

describe('App', () => {
  it('renders the shell with the application title', () => {
    mockFetch(() => new Promise(() => {}))

    render(<App />)

    expect(screen.getByText('React Test App')).toBeInTheDocument()
  })

  it('mounts the features inside the centered content area', async () => {
    mockFetch(respondWith({ status: 'ok' }))

    render(<App />)

    expect(screen.getByRole('main')).toContainElement(await screen.findByRole('alert'))
  })

  it('shows a loading indicator while the API is being reached', () => {
    mockFetch(() => new Promise(() => {}))

    render(<App />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows the API status once the request resolves', async () => {
    mockFetch(respondWith({ status: 'ok' }))

    render(<App />)

    expect(await screen.findByText(/api status/i)).toBeInTheDocument()
    expect(screen.getByText('ok')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows an actionable error when the API is unreachable', async () => {
    mockFetch(() => Promise.reject(new TypeError('Failed to fetch')))

    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/unreachable/i)
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('shows an error when the API answers a failing status', async () => {
    mockFetch(respondWith({}, { ok: false, status: 502 }))

    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent('502')
  })

  it('retries the request when the user presses retry', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ status: 'ok' }) })

    render(<App />)
    await userEvent.click(await screen.findByRole('button', { name: /retry/i }))

    expect(await screen.findByText('ok')).toBeInTheDocument()
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2))
  })

  it('shows the empty state when the API answers with nothing to render', async () => {
    mockFetch(respondWith({}))

    render(<App />)

    expect(await screen.findByText(/reported no status/i)).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
  })

  it('shows the loading indicator again while the retry is in flight', async () => {
    let respond
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockImplementationOnce(() => new Promise((resolve) => { respond = resolve }))

    render(<App />)
    await userEvent.click(await screen.findByRole('button', { name: /retry/i }))

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryAllByRole('alert')).toHaveLength(0)

    respond({ ok: true, status: 200, json: async () => ({ status: 'ok' }) })
    expect(await screen.findByText('ok')).toBeInTheDocument()
  })

  it('shows one state at a time as the request resolves', async () => {
    mockFetch(respondWith({ status: 'ok' }))

    render(<App />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryAllByRole('alert')).toHaveLength(0)

    expect(await screen.findByText('ok')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryAllByRole('alert')).toHaveLength(1)
  })

  it('never leaks the transport error to the user', async () => {
    mockFetch(() => Promise.reject(new TypeError('ECONNREFUSED 127.0.0.1:3000')))

    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert).not.toHaveTextContent('ECONNREFUSED')
  })
})
