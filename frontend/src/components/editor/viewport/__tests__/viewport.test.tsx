import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders, screen } from '@/test/test-utils'

// Mock R3F completely — jsdom has no WebGL
vi.mock('@react-three/fiber', () => ({
  Canvas: () => <div data-testid="r3f-canvas">canvas mock</div>,
}))

vi.mock('../scene-content', () => ({
  SceneContent: () => null,
}))

const { Viewport } = await import('../../viewport')

describe('Viewport', () => {
  it('renders without crashing', () => {
    renderWithProviders(<Viewport />)
    expect(screen.getByTestId('viewport')).toBeInTheDocument()
  })

  it('contains the R3F canvas', () => {
    renderWithProviders(<Viewport />)
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument()
  })
})
