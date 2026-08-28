import { EmptyState } from '../../../shared/components/EmptyState.jsx'
import { ErrorAlert } from '../../../shared/components/ErrorAlert.jsx'
import { Loading } from '../../../shared/components/Loading.jsx'
import { FilesTable } from '../components/FilesTable.jsx'
import { useFilesData } from '../hooks/useFilesData.js'
import { toFileRows } from '../toFileRows.js'

/**
 * Connected view of the files feature: wires the hook to the components and
 * renders exactly one branch — loading, error, empty or data.
 *
 * @returns {JSX.Element}
 */
export const FilesPage = () => {
  const { data, loading, error, reload } = useFilesData()

  if (loading) return <Loading label="Loading the files" />
  if (error) return <ErrorAlert message={error} onRetry={reload} />

  const rows = toFileRows(data || [])
  if (rows.length === 0) return <EmptyState message="The API returned no file lines." />

  return <FilesTable rows={rows} />
}
