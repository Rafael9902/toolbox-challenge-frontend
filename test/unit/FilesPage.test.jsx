import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FilesPage } from '../../src/modules/files/pages/FilesPage.jsx'
import { useFilesData } from '../../src/modules/files/hooks/useFilesData.js'

jest.mock('../../src/modules/files/hooks/useFilesData.js')

const FILES = [
  { file: 'test3.csv', lines: [{ text: 'g', number: 101382507, hex: '65badd1f29e6235199261cd3026a97f5' }] },
  { file: 'test1.csv', lines: [] }
]

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
  useFilesData.mockReturnValue(state)
  render(<FilesPage />)
  return state
}

/** How the user recognises each state on screen. */
const MARKERS = {
  loading: () => screen.queryAllByRole('status'),
  error: () => screen.queryAllByRole('button', { name: /retry/i }),
  empty: () => screen.queryAllByText(/returned no file lines/i),
  data: () => screen.queryAllByRole('list')
}

describe('FilesPage', () => {
  it('shows a spinner while the request is in flight', () => {
    renderWith({ loading: true })

    expect(screen.getByRole('status')).toHaveTextContent('Loading the files')
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

  it('shows the empty state when the API returns no files', () => {
    renderWith({ data: [] })

    expect(screen.getByText('The API returned no file lines.')).toBeInTheDocument()
  })

  it('shows the empty state when every file arrived without lines', () => {
    renderWith({ data: [{ file: 'test1.csv', lines: [] }, { file: 'test2.csv', lines: [] }] })

    expect(screen.getByText('The API returned no file lines.')).toBeInTheDocument()
  })

  it('shows the files once they arrive', () => {
    renderWith({ data: FILES })

    expect(screen.getByText('test3.csv')).toBeInTheDocument()
    expect(screen.getByText('1 line')).toBeInTheDocument()
  })

  it('lists the files whose lines came empty alongside the rest', () => {
    renderWith({ data: FILES })

    expect(screen.getByText('test1.csv')).toBeInTheDocument()
    expect(screen.getByText('0 lines')).toBeInTheDocument()
  })
})

describe('FilesPage state exclusivity', () => {
  const SCENARIOS = [
    { when: 'the request is in flight', state: { loading: true }, shows: 'loading' },
    { when: 'the request failed', state: { error: 'Boom' }, shows: 'error' },
    { when: 'the response carries no files', state: { data: [] }, shows: 'empty' },
    {
      when: 'every file came without lines',
      state: { data: [{ file: 'test1.csv', lines: [] }] },
      shows: 'empty'
    },
    { when: 'the response carries files with lines', state: { data: FILES }, shows: 'data' },
    {
      when: 'a retry is in flight over a previous failure',
      state: { loading: true, error: 'Boom', data: FILES },
      shows: 'loading'
    },
    {
      when: 'a failure arrives over previous data',
      state: { error: 'Boom', data: FILES },
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
