import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { setupAutosave } from './lib/autosave'
import { isPersistenceAvailable } from './lib/persistence'
import { useProjectStore } from './store/project-store'
import { App } from './App'
import './index.css'

// Persistence check
if (!isPersistenceAvailable()) {
  useProjectStore.getState().setPersistenceAvailable(false)
}

// Start autosave subscription
setupAutosave(useProjectStore)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
