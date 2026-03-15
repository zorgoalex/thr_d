import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

  const handleNewEmpty = () => {
    navigate(buildEditorUrl(room))
  }

  const handleTemplate = (templateId: string) => {
    navigate(buildEditorUrl(room, templateId))
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
            disabled
            title="Autosave restore — Etap 5"
            className="w-full rounded-md border border-border px-4 py-2.5 text-sm text-muted-foreground opacity-50"
          >
            Restore from autosave
          </button>
        </div>

        <TemplateGrid onSelect={handleTemplate} />
      </div>
    </div>
  )
}
