import Table from 'react-bootstrap/Table'

/**
 * Presentational: renders the already flattened rows, one per line of every
 * file. Owns no state and makes no requests.
 *
 * @param {Object} props
 * @param {import('../toFileRows.js').FileRow[]} props.rows
 * @returns {JSX.Element}
 */
export const FilesTable = ({ rows }) => (
  <Table striped bordered hover responsive>
    <caption className='visually-hidden'>Lines parsed from every file</caption>
    <thead>
      <tr>
        <th scope='col'>File Name</th>
        <th scope='col'>Text</th>
        <th scope='col'>Number</th>
        <th scope='col'>Hex</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(({ id, file, text, number, hex }) => (
        <tr key={id}>
          <td>{file}</td>
          <td>{text}</td>
          <td>{number}</td>
          <td className='text-break'>{hex}</td>
        </tr>
      ))}
    </tbody>
  </Table>
)
