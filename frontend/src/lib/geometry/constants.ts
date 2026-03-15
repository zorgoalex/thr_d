/** Numeric comparison tolerance (mm) */
export const EPSILON = 0.01

/** Max overlap treated as assembly contact, not intersection (mm) */
export const PENETRATION_THRESHOLD = 0.5

/** Max distance for snap to engage (mm) */
export const SNAP_DISTANCE_THRESHOLD = 10

/** Visual micro-offset to prevent Z-fighting (mm). NOT in canonical model. */
export const VISUAL_OFFSET = 0.1

/** Allowed rotation values (degrees around Y axis) */
export const ALLOWED_ROTATIONS = [0, 90, 180, 270] as const

/** World coordinate absolute limit (mm) */
export const WORLD_RANGE_LIMIT = 100_000
