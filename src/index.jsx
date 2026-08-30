import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import 'bootstrap/dist/css/bootstrap.min.css'

import { App } from './App.jsx'
import { createAppStore } from './store.js'

createRoot(document.getElementById('root')).render(
  <Provider store={createAppStore()}>
    <App />
  </Provider>
)
