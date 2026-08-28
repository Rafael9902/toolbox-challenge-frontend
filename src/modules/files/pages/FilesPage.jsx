import { EmptyState } from '../../../shared/components/EmptyState.jsx'
import { ErrorAlert } from '../../../shared/components/ErrorAlert.jsx'
import { Loading } from '../../../shared/components/Loading.jsx'
import { HealthBadge } from '../components/HealthBadge.jsx'
import { useHealth } from '../hooks/useHealth.js'

/**
 * Connected view of the files feature: wires the hook to the components and
 * renders exactly one branch — loading, error, empty or data.
 *
 * @returns {JSX.Element}
 */
export const FilesPage = () => {
  const { data, loading, error, reload } = useHealth()

  if (loading) return <Loading label="Checking the API" />
  if (error) return <ErrorAlert message={error} onRetry={reload} />
  if (!data || !data.status) return <EmptyState message="The API reported no status." />

  return <HealthBadge status={data.status} />
}
