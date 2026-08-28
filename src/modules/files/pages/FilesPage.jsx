import { ErrorAlert } from '../../../shared/components/ErrorAlert.jsx'
import { Loading } from '../../../shared/components/Loading.jsx'
import { HealthBadge } from '../components/HealthBadge.jsx'
import { useHealth } from '../hooks/useHealth.js'

/**
 * Connected view of the files feature: wires the hook to the components and
 * renders the loading, error and data branches.
 *
 * @returns {JSX.Element}
 */
export const FilesPage = () => {
  const { data, loading, error, reload } = useHealth()

  if (loading) return <Loading label="Checking the API" />
  if (error) return <ErrorAlert message={error} onRetry={reload} />

  return <HealthBadge status={data.status} />
}
