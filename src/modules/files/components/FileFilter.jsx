import Form from 'react-bootstrap/Form'

/**
 * Presentational: the dropdown that narrows the screen to one file. It renders
 * disabled while there are no names to offer, which is also what happens when
 * the listing endpoint failed.
 *
 * @param {Object} props
 * @param {string[]} props.fileNames     Names offered besides "All files".
 * @param {string}   props.selectedFile  Empty string keeps "All files" chosen.
 * @param {Function} props.onSelect      Receives the chosen name.
 * @returns {JSX.Element}
 */
export const FileFilter = ({ fileNames, selectedFile, onSelect }) => (
  <Form.Group className='mb-3' controlId='file-name-filter'>
    <Form.Label>Filter by file name</Form.Label>
    <Form.Select
      value={selectedFile}
      disabled={fileNames.length === 0}
      onChange={(event) => onSelect(event.target.value)}
    >
      <option value=''>All files</option>
      {fileNames.map((fileName) => (
        <option key={fileName} value={fileName}>
          {fileName}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
)
