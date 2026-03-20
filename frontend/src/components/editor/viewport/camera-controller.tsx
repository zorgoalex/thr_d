import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import { setOrbitControls } from '@/lib/orbit-controls-ref'
import { useProjectStore } from '@/store/project-store'

import { getCameraPresets } from './camera-presets'

export function CameraController() {
  const cameraMode = useProjectStore((s) => s.cameraMode)
  const room = useProjectStore((s) => s.project?.room)
  const controlsRef = useRef<OrbitControlsImpl>(null)

  const roomDims = room ?? { widthMm: 3000, lengthMm: 3000, heightMm: 2700 }
  const presets = getCameraPresets(roomDims)
  const preset = presets[cameraMode]

  const isPerspective = cameraMode === 'perspective'

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(...preset.target)
      controlsRef.current.update()
      setOrbitControls(controlsRef.current)
    }
    return () => setOrbitControls(null)
  }, [preset.target])

  return (
    <>
      {isPerspective ? (
        <PerspectiveCamera
          makeDefault
          position={preset.position}
          up={preset.up}
          fov={50}
          near={1}
          far={100000}
        />
      ) : (
        <OrthographicCamera
          makeDefault
          position={preset.position}
          up={preset.up}
          zoom={0.5}
          near={-100000}
          far={100000}
        />
      )}
      <OrbitControls
        ref={controlsRef}
        key={cameraMode}
        enableRotate={isPerspective}
        enablePan={true}
        enableZoom={true}
        target={preset.target}
        mouseButtons={{
          LEFT: isPerspective ? 0 : 2, // ROTATE : PAN
          MIDDLE: 2, // PAN
          RIGHT: 2, // PAN
        }}
      />
    </>
  )
}
