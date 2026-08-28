import { Layout } from './shared/components/Layout.jsx'
import { FilesPage } from './modules/files/index.js'

/**
 * Composes the shell with every feature the app mounts.
 *
 * @returns {JSX.Element}
 */
export const App = () => (
  <Layout>
    <FilesPage />
  </Layout>
)
