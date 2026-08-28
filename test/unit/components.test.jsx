import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EmptyState } from '../../src/shared/components/EmptyState.jsx'
import { ErrorAlert } from '../../src/shared/components/ErrorAlert.jsx'
import { Loading } from '../../src/shared/components/Loading.jsx'
import { FilesSummary } from '../../src/modules/files/components/FilesSummary.jsx'

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

describe('FilesSummary', () => {
  const FILES = [
    { file: 'test3.csv', lines: [{ text: 'g', number: 1, hex: 'abc' }] },
    { file: 'test9.csv', lines: [{ text: 'a', number: 2, hex: 'def' }, { text: 'b', number: 3, hex: 'ghi' }] },
    { file: 'test1.csv', lines: [] }
  ]

  it('lists one entry per file it is handed', () => {
    render(<FilesSummary files={FILES} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('shows how many lines each file carries', () => {
    render(<FilesSummary files={FILES} />)

    expect(screen.getByText('1 line')).toBeInTheDocument()
    expect(screen.getByText('2 lines')).toBeInTheDocument()
    expect(screen.getByText('0 lines')).toBeInTheDocument()
  })

  it('renders a file whose lines came empty without breaking', () => {
    render(<FilesSummary files={[{ file: 'test1.csv', lines: [] }]} />)

    expect(screen.getByText('test1.csv')).toBeInTheDocument()
  })
})
