import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'

import { getScene } from './scene-ref'

export async function exportSceneGlb(filename = 'scene.glb'): Promise<void> {
  const scene = getScene()
  if (!scene) throw new Error('Scene not available for GLB export.')

  const exporter = new GLTFExporter()
  const glb = await exporter.parseAsync(scene, { binary: true })

  const blob = new Blob([glb as ArrayBuffer], { type: 'model/gltf-binary' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
