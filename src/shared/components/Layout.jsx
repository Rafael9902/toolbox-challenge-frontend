import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Row from 'react-bootstrap/Row'

/**
 * Page frame: title bar plus a centered content area laid out on the
 * Bootstrap grid, so it reflows on narrow viewports.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 * @returns {JSX.Element}
 */
export const Layout = ({ children }) => (
  <>
    <Navbar bg="danger" variant="dark" className="mb-4">
      <Container>
        <Navbar.Brand as="h1" className="h4 mb-0">
          React Test App
        </Navbar.Brand>
      </Container>
    </Navbar>
    <Container as="main" className="pb-4">
      <Row className="justify-content-center">
        <Col xs={12} xl={10}>
          {children}
        </Col>
      </Row>
    </Container>
  </>
)
