import ListGroup from 'react-bootstrap/ListGroup'

/**
 * Presentational: lists the files that arrived and how many lines each one
 * carries. Owns no state and makes no requests.
 *
 * @param {Object} props
 * @param {import('../files.api.js').FileData[]} props.files
 * @returns {JSX.Element}
 */
export const FilesSummary = ({ files }) => (
  <ListGroup as="ul">
    {files.map(({ file, lines }) => (
      <ListGroup.Item as="li" key={file} className="d-flex justify-content-between">
        <span>{file}</span>
        <span>{lines.length === 1 ? '1 line' : `${lines.length} lines`}</span>
      </ListGroup.Item>
    ))}
  </ListGroup>
)
