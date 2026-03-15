import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useEditorHotkeys } from '@/hooks/use-editor-hotkeys'
import { useInitProject } from '@/hooks/use-init-project'
import { useValidationEffect } from '@/hooks/use-validation-effect'
import type { RoomSize } from '@/types/api'

import { LeftPanel } from './left-panel'
import { RightPanel } from './right-panel'
import { StatusBar } from './status-bar'
import { TopBar } from './top-bar'
import { Viewport } from './viewport'

export function EditorShell() {
  const [params] = useSearchParams()

  const room: RoomSize = useMemo(
    () => ({
      widthMm: Number(params.get('widthMm') ?? 3000),
      lengthMm: Number(params.get('lengthMm') ?? 3000),
      heightMm: Number(params.get('heightMm') ?? 2700),
    }),
    [params],
  )
  const templateId = params.get('templateId')

  const { isReady } = useInitProject(room, templateId)
  useEditorHotkeys()
  useValidationEffect()

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading project…
      </div>
    )
  }

  return (
    <div className="grid h-screen grid-cols-[280px_1fr_300px] grid-rows-[auto_1fr_auto]">
      <TopBar />
      <LeftPanel />
      <Viewport />
      <RightPanel />
      <StatusBar />
    </div>
  )
}
