import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EmptyState } from '../../src/shared/components/EmptyState.jsx'
import { ErrorAlert } from '../../src/shared/components/ErrorAlert.jsx'
import { Loading } from '../../src/shared/components/Loading.jsx'
import { FilesTable } from '../../src/modules/files/components/FilesTable.jsx'

describe('Loading', () => {
  it('exposes an accessible description of what is loading', () => {
    render(<Loading label="Checking the API" />)

    expect(screen.getByRole('status')).toHaveTextContent('Checking the API')
  })

  it('renders the Bootstrap spinner', () => {
    render(<Loading />)

    expect(screen.getByRole('status')).toHaveClass('spinner-border')
  })
})

describe('ErrorAlert', () => {
  it('shows the message', () => {
    render(<ErrorAlert message="The API is unreachable." />)

    expect(screen.getByRole('alert')).toHaveTextContent('The API is unreachable.')
  })

  it('signals the failure with the danger variant', () => {
    render(<ErrorAlert message="Boom" />)

    expect(screen.getByRole('alert')).toHaveClass('alert-danger')
  })

  it('offers no retry button when there is nothing to retry', () => {
    render(<ErrorAlert message="Boom" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onRetry when the button is pressed', async () => {
    const onRetry = jest.fn()
    render(<ErrorAlert message="Boom" onRetry={onRetry} />)

    await userEvent.click(screen.getByRole('button', { name: /retry/i }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

describe('EmptyState', () => {
  it('shows the message it is handed', () => {
    render(<EmptyState message="The API reported no status." />)

    expect(screen.getByText('The API reported no status.')).toBeInTheDocument()
  })

  it('falls back to a generic message', () => {
    render(<EmptyState />)

    expect(screen.getByText('No data available.')).toBeInTheDocument()
  })

  it('does not look like a failure', () => {
    render(<EmptyState />)

    expect(screen.getByText('No data available.')).not.toHaveClass('alert-danger')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

/** Reads the keys React will use for the rows, which the DOM does not expose. */
const rowKeys = (rows) => {
  const children = FilesTable({ rows }).props.children
  const body = children.find((child) => child.type === 'tbody')
  return body.props.children.map((row) => row.key)
}

describe('FilesTable', () => {
  const ROWS = [
    {
      id: 'test3.csv|101382507|65badd1f29e6235199261cd3026a97f5',
      file: 'test3.csv',
      text: 'g',
      number: 101382507,
      hex: '65badd1f29e6235199261cd3026a97f5'
    },
    {
      id: 'test3.csv|57685292|cb6dfa6422d170d2ae99aaf3f99665e4',
      file: 'test3.csv',
      text: 'mwmBQxoeKkxMm',
      number: 57685292,
      hex: 'cb6dfa6422d170d2ae99aaf3f99665e4'
    },
    {
      id: 'test9.csv|527447|b57c543e4d1f0dab7d4353f9dd0db302',
      file: 'test9.csv',
      text: 'clnburZYpPQgBiveSSeq',
      number: 527447,
      hex: 'b57c543e4d1f0dab7d4353f9dd0db302'
    }
  ]

  it('heads the table with the four columns of the challenge', () => {
    render(<FilesTable rows={ROWS} />)

    expect(screen.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual([
      'File Name',
      'Text',
      'Number',
      'Hex'
    ])
  })

  it('renders one row per line, plus the header row', () => {
    render(<FilesTable rows={ROWS} />)

    expect(screen.getAllByRole('row')).toHaveLength(ROWS.length + 1)
  })

  it('repeats the file name on every row of the same file', () => {
    render(<FilesTable rows={ROWS} />)

    expect(screen.getAllByRole('cell', { name: 'test3.csv' })).toHaveLength(2)
  })

  it('shows the text, the number and the hex of a line', () => {
    render(<FilesTable rows={ROWS} />)

    const cells = within(screen.getAllByRole('row')[2]).getAllByRole('cell')
    expect(cells.map((cell) => cell.textContent)).toEqual([
      'test3.csv',
      'mwmBQxoeKkxMm',
      '57685292',
      'cb6dfa6422d170d2ae99aaf3f99665e4'
    ])
  })

  it('flattens the rows of several files into the same table', () => {
    render(<FilesTable rows={ROWS} />)

    expect(screen.getAllByRole('row')[3]).toHaveTextContent('test9.csv')
  })

  it('keys every row by its identity, never by its position', () => {
    expect(rowKeys(ROWS)).toEqual(ROWS.map(({ id }) => id))
    expect(rowKeys(ROWS)).not.toEqual(['0', '1', '2'])
  })

  it('keeps the keys unique across the whole table', () => {
    const keys = rowKeys(ROWS)

    expect(new Set(keys).size).toBe(keys.length)
  })

  it('renders the headers without any data row when handed no rows', () => {
    render(<FilesTable rows={[]} />)

    expect(screen.getAllByRole('row')).toHaveLength(1)
    expect(screen.getByRole('columnheader', { name: 'File Name' })).toBeInTheDocument()
  })
})
