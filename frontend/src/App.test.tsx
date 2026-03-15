import { describe, expect, it } from 'vitest'

import { App } from './App'
import { renderWithProviders, screen } from './test/test-utils'

describe('App smoke test', () => {
  it('renders the start screen at /', () => {
    renderWithProviders(<App />)

    expect(
      screen.getByRole('heading', { name: /thr_d/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('New empty project')).toBeInTheDocument()
  })
})
