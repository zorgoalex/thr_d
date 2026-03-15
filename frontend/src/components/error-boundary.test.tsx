import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders, screen } from '@/test/test-utils'

import { ErrorBoundary } from './error-boundary'

function ThrowingChild(): React.ReactNode {
  throw new Error('Test error')
}

describe('ErrorBoundary', () => {
  it('renders fallback when child throws', () => {
    // Suppress React error boundary console.error
    vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.getByText('Reload')).toBeInTheDocument()

    vi.restoreAllMocks()
  })

  it('renders children normally when no error', () => {
    renderWithProviders(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>,
    )

    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })
})
