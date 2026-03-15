import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders, screen } from '@/test/test-utils'

import { RoomSizeForm } from './room-size-form'

describe('RoomSizeForm', () => {
  const defaultRoom = { widthMm: 3000, lengthMm: 3000, heightMm: 2700 }

  it('renders three inputs with default values', () => {
    renderWithProviders(
      <RoomSizeForm value={defaultRoom} onChange={vi.fn()} />,
    )

    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs).toHaveLength(3)
    expect(inputs[0]).toHaveValue(3000)
    expect(inputs[1]).toHaveValue(3000)
    expect(inputs[2]).toHaveValue(2700)
  })

  it('calls onChange when a value changes', async () => {
    const onChange = vi.fn()
    renderWithProviders(
      <RoomSizeForm value={defaultRoom} onChange={onChange} />,
    )

    const widthInput = screen.getAllByRole('spinbutton')[0]!
    await import('@testing-library/user-event').then(async (m) => {
      const user = m.default.setup()
      await user.clear(widthInput)
      await user.type(widthInput, '4000')
    })

    expect(onChange).toHaveBeenCalled()
  })
})
