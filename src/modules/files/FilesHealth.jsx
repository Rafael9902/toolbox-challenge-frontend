import Alert from 'react-bootstrap/Alert'

import { ErrorAlert } from '../../shared/components/ErrorAlert.jsx'
import { Loading } from '../../shared/components/Loading.jsx'
import { useHealth } from './files.hooks.js'

/**
 * Renders the API health. Presentation only: the request lives in the hook.
 *
 * @returns {JSX.Element}
 */
export const FilesHealth = () => {
  const { data, loading, error, reload } = useHealth()

  if (loading) return <Loading label="Checking the API" />
  if (error) return <ErrorAlert message={error} onRetry={reload} />

  return (
    <Alert variant="success">
      API status: <strong>{data.status}</strong>
    </Alert>
  )
}
