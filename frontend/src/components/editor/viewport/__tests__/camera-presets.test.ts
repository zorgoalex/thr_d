import { describe, expect, it } from 'vitest'

import { getCameraPresets } from '../camera-presets'

const room = { widthMm: 3000, lengthMm: 3000, heightMm: 2700 }

describe('getCameraPresets', () => {
  const presets = getCameraPresets(room)

  it('returns all 5 modes', () => {
    expect(Object.keys(presets)).toEqual(['perspective', 'front', 'left', 'right', 'top'])
  })

  it('perspective is not orthographic', () => {
    expect(presets.perspective.orthographic).toBe(false)
  })

  it('front/left/right/top are orthographic', () => {
    expect(presets.front.orthographic).toBe(true)
    expect(presets.left.orthographic).toBe(true)
    expect(presets.right.orthographic).toBe(true)
    expect(presets.top.orthographic).toBe(true)
  })

  it('top view has up = [0, 0, -1]', () => {
    expect(presets.top.up).toEqual([0, 0, -1])
  })

  it('all presets have target near room center', () => {
    for (const preset of Object.values(presets)) {
      // target should be roughly at room center
      expect(preset.target[0]).toBeCloseTo(1500, 0)
    }
  })

  it('perspective position is outside room', () => {
    const p = presets.perspective.position
    expect(p[0]).toBeGreaterThan(room.widthMm)
    expect(p[1]).toBeGreaterThan(0)
    expect(p[2]).toBeGreaterThan(room.lengthMm)
  })
})
