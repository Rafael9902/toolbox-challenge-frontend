import Alert from 'react-bootstrap/Alert'

/**
 * Says the request succeeded but there is nothing to show, so an empty
 * response never looks like a blank screen.
 *
 * @param {Object} props
 * @param {string} [props.message]
 * @returns {JSX.Element}
 */
export const EmptyState = ({ message = 'No data available.' }) => (
  <Alert variant="secondary" className="text-center">
    {message}
  </Alert>
)
