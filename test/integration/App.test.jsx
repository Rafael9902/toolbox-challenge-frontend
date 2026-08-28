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

  it('never leaks the transport error to the user', async () => {
    mockFetch(() => Promise.reject(new TypeError('ECONNREFUSED 127.0.0.1:3000')))

    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert).not.toHaveTextContent('ECONNREFUSED')
  })
})
