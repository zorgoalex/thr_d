import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useHasAutosave } from '@/hooks/use-has-autosave'
import { getLastProjectId, loadProject } from '@/lib/persistence'
import { useProjectStore } from '@/store/project-store'
import type { RoomSize } from '@/types/api'

import { RoomSizeForm } from './room-size-form'
import { TemplateGrid } from './template-grid'

const DEFAULT_ROOM: RoomSize = {
  widthMm: 3000,
  lengthMm: 3000,
  heightMm: 2700,
}

function buildEditorUrl(room: RoomSize, templateId?: string) {
  const params = new URLSearchParams({
    widthMm: String(room.widthMm),
    lengthMm: String(room.lengthMm),
    heightMm: String(room.heightMm),
  })
  if (templateId) params.set('templateId', templateId)
  return `/editor?${params.toString()}`
}

export function StartScreen() {
  const navigate = useNavigate()
  const [room, setRoom] = useState<RoomSize>(DEFAULT_ROOM)
  const { hasAutosave, isChecking } = useHasAutosave()
  const setProject = useProjectStore((s) => s.setProject)

  const handleNewEmpty = () => {
    // Clear any existing project so editor creates fresh
    useProjectStore.setState({ project: null })
    navigate(buildEditorUrl(room))
  }

  const handleTemplate = (templateId: string) => {
    useProjectStore.setState({ project: null })
    navigate(buildEditorUrl(room, templateId))
  }

  const handleRestore = async () => {
    const id = await getLastProjectId()
    if (!id) return
    const data = await loadProject(id)
    if (!data) return
    setProject(data.project)
    useProjectStore.setState({
      leftPanelOpen: data.uiState.leftPanelOpen,
      rightPanelOpen: data.uiState.rightPanelOpen,
      activeTab: data.uiState.activeTab,
      isDirty: false,
    })
    navigate('/editor')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">thr_d</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            3D furniture constructor
          </p>
        </div>

        <RoomSizeForm value={room} onChange={setRoom} />

        <div className="flex flex-col gap-3">
          <button
            onClick={handleNewEmpty}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            New empty project
          </button>

          <button
            disabled={isChecking || !hasAutosave}
            onClick={handleRestore}
            className="w-full rounded-md border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            Restore from autosave
          </button>
        </div>

        <TemplateGrid onSelect={handleTemplate} />
      </div>
    </div>
  )
}
