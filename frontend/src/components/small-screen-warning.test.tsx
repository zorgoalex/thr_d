import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders, screen } from '@/test/test-utils'

import { SmallScreenWarning } from './small-screen-warning'

describe('SmallScreenWarning', () => {
  it('shows warning when window is too narrow', () => {
    vi.stubGlobal('innerWidth', 1000)
    renderWithProviders(<SmallScreenWarning />)

    expect(screen.getByTestId('small-screen-warning')).toBeInTheDocument()
    vi.unstubAllGlobals()
  })

  it('does not show warning when window is wide enough', () => {
    vi.stubGlobal('innerWidth', 1400)
    renderWithProviders(<SmallScreenWarning />)

    expect(screen.queryByTestId('small-screen-warning')).not.toBeInTheDocument()
    vi.unstubAllGlobals()
  })
})
