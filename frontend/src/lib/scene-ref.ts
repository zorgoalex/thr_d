import type { Scene } from 'three'

let sceneRef: Scene | null = null

export function setScene(scene: Scene) {
  sceneRef = scene
}

export function getScene(): Scene | null {
  return sceneRef
}
