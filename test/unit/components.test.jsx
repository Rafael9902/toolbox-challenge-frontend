import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ErrorAlert } from '../../src/shared/components/ErrorAlert.jsx'
import { Loading } from '../../src/shared/components/Loading.jsx'

describe('Loading', () => {
  it('exposes an accessible description of what is loading', () => {
    render(<Loading label="Checking the API" />)

    expect(screen.getByRole('status')).toHaveTextContent('Checking the API')
  })
})

describe('ErrorAlert', () => {
  it('shows the message', () => {
    render(<ErrorAlert message="The API is unreachable." />)

    expect(screen.getByRole('alert')).toHaveTextContent('The API is unreachable.')
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
