import { Route, Routes } from 'react-router-dom'

import { EditorShell } from '@/components/editor/editor-shell'
import { ErrorBoundary } from '@/components/error-boundary'
import { SmallScreenWarning } from '@/components/small-screen-warning'
import { StartScreen } from '@/components/start-screen/start-screen'

export function App() {
  return (
    <ErrorBoundary>
      <SmallScreenWarning />
      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/editor" element={<EditorShell />} />
      </Routes>
    </ErrorBoundary>
  )
}
