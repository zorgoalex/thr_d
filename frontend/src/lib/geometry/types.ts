/** Axis-aligned bounding box in world coordinates (mm) */
export interface AABB {
  minX: number
  maxX: number
  minY: number
  maxY: number
  minZ: number
  maxZ: number
}

/** Resolved absolute world-space position + rotation */
export interface WorldTransform {
  xMm: number
  yMm: number
  zMm: number
  rotationYDeg: 0 | 90 | 180 | 270
}

/** Snap priority levels: 1 = walls/floor, 2 = neighbors, 3 = grid */
export type SnapLevel = 1 | 2 | 3

export interface SnapCandidate {
  level: SnapLevel
  axis: 'x' | 'y' | 'z'
  targetMm: number
  distanceMm: number
  label: string
}

export interface SnapResult {
  xMm: number
  yMm: number
  zMm: number
  appliedSnaps: SnapCandidate[]
}

export const ValidationCode = {
  ROOM_BOUNDS_EXCEEDED: 'ROOM_BOUNDS_EXCEEDED',
  ITEM_INTERSECTION: 'ITEM_INTERSECTION',
  INVALID_DIMENSIONS: 'INVALID_DIMENSIONS',
  INVALID_THICKNESS: 'INVALID_THICKNESS',
  OUT_OF_ALLOWED_WORLD_RANGE: 'OUT_OF_ALLOWED_WORLD_RANGE',
  ITEM_BELOW_FLOOR: 'ITEM_BELOW_FLOOR',
  INVALID_ROTATION: 'INVALID_ROTATION',
} as const

export type ValidationCodeType = (typeof ValidationCode)[keyof typeof ValidationCode]
