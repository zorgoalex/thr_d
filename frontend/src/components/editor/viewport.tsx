import { Canvas } from '@react-three/fiber'
import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

import { useCameraMode } from '@/hooks/use-camera-mode'

import { SceneContent } from './viewport/scene-content'

class ViewportErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Viewport error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p>3D viewport error</p>
            <button
              className="mt-2 text-xs text-primary underline"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export function Viewport() {
  useCameraMode()

  return (
    <main className="relative" data-testid="viewport">
      <ViewportErrorBoundary>
        <Canvas
          gl={{ antialias: true }}
          style={{ background: '#111' }}
        >
          <SceneContent />
        </Canvas>
      </ViewportErrorBoundary>
    </main>
  )
}
