import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'

import './layout.css'

/**
 * Page frame: the application bar on top and the content below, both spanning
 * the viewport as the wireframe shows.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 * @returns {JSX.Element}
 */
export const Layout = ({ children }) => (
  <>
    <Navbar variant='dark' className='app-bar mb-4'>
      <Container fluid>
        <Navbar.Brand as='h1' className='h4 mb-0'>
          React Test App
        </Navbar.Brand>
      </Container>
    </Navbar>
    <Container fluid as='main' className='pb-4'>
      {children}
    </Container>
  </>
)
