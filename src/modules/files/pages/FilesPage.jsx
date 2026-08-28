import { EmptyState } from '../../../shared/components/EmptyState.jsx'
import { ErrorAlert } from '../../../shared/components/ErrorAlert.jsx'
import { Loading } from '../../../shared/components/Loading.jsx'
import { FilesSummary } from '../components/FilesSummary.jsx'
import { useFilesData } from '../hooks/useFilesData.js'

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

  const files = data || []
  const hasLines = files.some(({ lines }) => lines.length > 0)
  if (!hasLines) return <EmptyState message="The API returned no file lines." />

  return <FilesSummary files={files} />
}
