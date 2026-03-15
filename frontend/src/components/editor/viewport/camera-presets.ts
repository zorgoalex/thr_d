import type { CameraMode } from '@/types/project'

export interface CameraPreset {
  position: [number, number, number]
  up: [number, number, number]
  target: [number, number, number]
  orthographic: boolean
}

/**
 * Get camera presets for each mode.
 * Room dimensions in mm — positions calculated to frame the room.
 */
export function getCameraPresets(room: {
  widthMm: number
  lengthMm: number
  heightMm: number
}): Record<CameraMode, CameraPreset> {
  const w = room.widthMm
  const h = room.heightMm
  const d = room.lengthMm
  const cx = w / 2
  const cy = h / 2
  const cz = d / 2
  const dist = Math.max(w, h, d) * 2

  return {
    perspective: {
      position: [w * 1.5, h * 1.2, d * 1.5],
      up: [0, 1, 0],
      target: [cx, cy, cz],
      orthographic: false,
    },
    front: {
      position: [cx, cy, dist],
      up: [0, 1, 0],
      target: [cx, cy, cz],
      orthographic: true,
    },
    left: {
      position: [-dist, cy, cz],
      up: [0, 1, 0],
      target: [cx, cy, cz],
      orthographic: true,
    },
    right: {
      position: [dist + w, cy, cz],
      up: [0, 1, 0],
      target: [cx, cy, cz],
      orthographic: true,
    },
    top: {
      position: [cx, dist, cz],
      up: [0, 0, -1],
      target: [cx, 0, cz],
      orthographic: true,
    },
  }
}
