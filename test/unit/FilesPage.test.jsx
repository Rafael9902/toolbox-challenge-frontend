import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FilesPage } from '../../src/modules/files/pages/FilesPage.jsx'
import { useHealth } from '../../src/modules/files/hooks/useHealth.js'

jest.mock('../../src/modules/files/hooks/useHealth.js')

/** Builds the hook result, so each test only states what it cares about. */
const asyncState = (overrides) => ({
  data: null,
  loading: false,
  error: null,
  reload: jest.fn(),
  ...overrides
})

const renderWith = (overrides) => {
  const state = asyncState(overrides)
  useHealth.mockReturnValue(state)
  render(<FilesPage />)
  return state
}

/** How the user recognises each state on screen. */
const MARKERS = {
  loading: () => screen.queryAllByRole('status'),
  error: () => screen.queryAllByRole('button', { name: /retry/i }),
  empty: () => screen.queryAllByText(/reported no status/i),
  data: () => screen.queryAllByText(/api status/i)
}

describe('FilesPage', () => {
  it('shows a spinner while the request is in flight', () => {
    renderWith({ loading: true })

    expect(screen.getByRole('status')).toHaveTextContent('Checking the API')
  })

  it('shows the failure message with a way to retry when the request fails', () => {
    renderWith({ error: 'The API is unreachable. Is it running?' })

    expect(screen.getByRole('alert')).toHaveTextContent('The API is unreachable. Is it running?')
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('reloads when the user presses retry', async () => {
    const { reload } = renderWith({ error: 'Boom' })

    await userEvent.click(screen.getByRole('button', { name: /retry/i }))

    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('shows the empty state when the response carries nothing to render', () => {
    renderWith({ data: {} })

    expect(screen.getByText('The API reported no status.')).toBeInTheDocument()
  })

  it('shows the data once it arrives', () => {
    renderWith({ data: { status: 'ok' } })

    expect(screen.getByText('ok')).toBeInTheDocument()
  })
})

describe('FilesPage state exclusivity', () => {
  const SCENARIOS = [
    { when: 'the request is in flight', state: { loading: true }, shows: 'loading' },
    { when: 'the request failed', state: { error: 'Boom' }, shows: 'error' },
    { when: 'the response carries no status', state: { data: {} }, shows: 'empty' },
    { when: 'the response carries a status', state: { data: { status: 'ok' } }, shows: 'data' },
    {
      when: 'a retry is in flight over a previous failure',
      state: { loading: true, error: 'Boom', data: { status: 'ok' } },
      shows: 'loading'
    },
    {
      when: 'a failure arrives over previous data',
      state: { error: 'Boom', data: { status: 'ok' } },
      shows: 'error'
    }
  ]

  it.each(SCENARIOS)('shows only the $shows state when $when', ({ state, shows }) => {
    renderWith(state)

    Object.entries(MARKERS).forEach(([name, query]) => {
      expect({ [name]: query().length }).toEqual({ [name]: name === shows ? 1 : 0 })
    })
  })
})
