import { Route, Routes, useSearchParams } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen, waitFor } from '@/test/test-utils'

import { StartScreen } from './start-screen'

function EditorStub() {
  const [params] = useSearchParams()
  return <div data-testid="editor">Editor {params.toString()}</div>
}

function renderStartScreen() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/editor" element={<EditorStub />} />
    </Routes>,
  )
}

describe('StartScreen', () => {
  it('renders key elements', async () => {
    renderStartScreen()

    expect(screen.getByText('New empty project')).toBeInTheDocument()
    expect(screen.getByText('Restore from autosave')).toBeInTheDocument()
    expect(screen.getByText('Room dimensions (mm)')).toBeInTheDocument()

    // Templates load async
    await waitFor(() => {
      expect(screen.getByText('Шкаф')).toBeInTheDocument()
    })
  })

  it('navigates to editor with default room dims on New Empty', async () => {
    const { getByText } = renderStartScreen()

    getByText('New empty project').click()

    await waitFor(() => {
      expect(screen.getByTestId('editor')).toHaveTextContent(
        'widthMm=3000',
      )
    })
  })

  it('navigates to editor with template on template select', async () => {
    renderStartScreen()

    await waitFor(() => {
      expect(screen.getByText('Шкаф')).toBeInTheDocument()
    })

    screen.getByText('Шкаф').click()

    await waitFor(() => {
      expect(screen.getByTestId('editor')).toHaveTextContent(
        'templateId=tpl-wardrobe',
      )
    })
  })

  it('autosave restore button is disabled', () => {
    renderStartScreen()
    expect(screen.getByText('Restore from autosave')).toBeDisabled()
  })
})
