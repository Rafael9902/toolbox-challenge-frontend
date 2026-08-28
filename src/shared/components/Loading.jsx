import Spinner from 'react-bootstrap/Spinner'

/**
 * @param {Object} props
 * @param {string} [props.label]  Accessible description of what is loading.
 * @returns {JSX.Element}
 */
export const Loading = ({ label = 'Loading' }) => (
  <div className="text-center py-4">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">{label}</span>
    </Spinner>
  </div>
)
