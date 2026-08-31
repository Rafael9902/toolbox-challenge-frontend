import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Row from 'react-bootstrap/Row'

/**
 * Page frame: a plain bar on top and a centered content area laid out on the
 * Bootstrap grid, so it reflows on narrow viewports.
 *
 * The bar carries no text. It is decorative, so it is hidden from assistive
 * technology instead of announcing an empty landmark.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 * @returns {JSX.Element}
 */
export const Layout = ({ children }) => (
  <>
    <Navbar bg="danger" variant="dark" className="mb-4 py-4" aria-hidden="true" />
    <Container as="main" className="pb-4">
      <Row className="justify-content-center">
        <Col xs={12} xl={10}>
          {children}
        </Col>
      </Row>
    </Container>
  </>
)
