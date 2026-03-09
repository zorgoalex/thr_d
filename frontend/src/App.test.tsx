import { render, screen } from '@testing-library/react'

import App from './App'

describe('App smoke test', () => {
  it('renders the project heading', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /thr_d 3d furniture constructor/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/frontend shell is online/i)).toBeInTheDocument()
  })
})
