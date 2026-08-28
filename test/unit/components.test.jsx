import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EmptyState } from '../../src/shared/components/EmptyState.jsx'
import { ErrorAlert } from '../../src/shared/components/ErrorAlert.jsx'
import { Loading } from '../../src/shared/components/Loading.jsx'
import { HealthBadge } from '../../src/modules/files/components/HealthBadge.jsx'

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

describe('HealthBadge', () => {
  it('shows the status it is handed', () => {
    render(<HealthBadge status="ok" />)

    expect(screen.getByRole('alert')).toHaveTextContent('API status: ok')
  })

  it('renders whatever status arrives, without deciding what is healthy', () => {
    render(<HealthBadge status="degraded" />)

    expect(screen.getByText('degraded')).toBeInTheDocument()
  })
})
