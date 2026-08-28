import Alert from 'react-bootstrap/Alert'

/**
 * Presentational: shows the API status it is handed. Owns no state and makes
 * no requests.
 *
 * @param {Object} props
 * @param {string} props.status
 * @returns {JSX.Element}
 */
export const HealthBadge = ({ status }) => (
  <Alert variant="success">
    API status: <strong>{status}</strong>
  </Alert>
)
