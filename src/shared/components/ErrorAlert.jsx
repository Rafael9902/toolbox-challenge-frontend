import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'

/**
 * @param {Object} props
 * @param {string} props.message
 * @param {Function} [props.onRetry]  When given, renders a retry button.
 * @returns {JSX.Element}
 */
export const ErrorAlert = ({ message, onRetry }) => (
  <Alert variant='danger' className='d-flex justify-content-between align-items-center'>
    <span>{message}</span>
    {onRetry && (
      <Button variant='outline-danger' size='sm' onClick={onRetry}>
        Retry
      </Button>
    )}
  </Alert>
)
