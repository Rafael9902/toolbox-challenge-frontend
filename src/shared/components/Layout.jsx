import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'

/**
 * Page frame: title bar plus a centered content area.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 * @returns {JSX.Element}
 */
export const Layout = ({ children }) => (
  <>
    <Navbar bg="danger" variant="dark" className="mb-4">
      <Container>
        <Navbar.Brand>React Test App</Navbar.Brand>
      </Container>
    </Navbar>
    <Container>{children}</Container>
  </>
)
