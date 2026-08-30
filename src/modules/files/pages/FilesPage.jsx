import { EmptyState } from '../../../shared/components/EmptyState.jsx'
import { ErrorAlert } from '../../../shared/components/ErrorAlert.jsx'
import { Loading } from '../../../shared/components/Loading.jsx'
import { FileFilter } from '../components/FileFilter.jsx'
import { FilesTable } from '../components/FilesTable.jsx'
import { useFileFilter } from '../hooks/useFileFilter.js'
import { useFilesData } from '../hooks/useFilesData.js'
import { toFileRows } from '../toFileRows.js'

/**
 * @param {string} selectedFile
 * @returns {string} Why there is nothing to show, told from the filter in use.
 */
const emptyMessage = (selectedFile) =>
  selectedFile ? `No lines were parsed from ${selectedFile}.` : 'The API returned no file lines.'

/**
 * Picks the single branch the request state maps to.
 *
 * @param {Object} state
 * @param {import('../hooks/useFilesData.js').AsyncState} state.request
 * @param {string} state.selectedFile
 * @returns {JSX.Element}
 */
const contentFor = ({ request: { data, loading, error, reload }, selectedFile }) => {
  if (loading) return <Loading label="Loading the files" />
  if (error) return <ErrorAlert message={error} onRetry={reload} />

  const rows = toFileRows(data || [])
  if (rows.length === 0) return <EmptyState message={emptyMessage(selectedFile)} />

  return <FilesTable rows={rows} />
}

/**
 * Connected view of the files feature: wires the hooks to the components and
 * renders the filter above exactly one branch — loading, error, empty or data.
 *
 * @returns {JSX.Element}
 */
export const FilesPage = () => {
  const request = useFilesData()
  const { fileNames, selectedFile, selectFile } = useFileFilter()

  return (
    <>
      <FileFilter fileNames={fileNames} selectedFile={selectedFile} onSelect={selectFile} />
      {contentFor({ request, selectedFile })}
    </>
  )
}
