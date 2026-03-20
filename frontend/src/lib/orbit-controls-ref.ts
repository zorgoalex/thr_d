import type { OrbitControls } from 'three-stdlib'

let ref: OrbitControls | null = null

export function setOrbitControls(controls: OrbitControls | null) {
  ref = controls
}

export function getOrbitControls(): OrbitControls | null {
  return ref
}
