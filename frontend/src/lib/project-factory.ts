import type { Project } from '@/types/project'
import type { RoomSize } from '@/types/api'

let counter = 0

export function createEmptyProject(
  room: RoomSize,
  templateId?: string,
): Project {
  const now = new Date().toISOString()
  counter += 1
  return {
    id: `project-${Date.now()}-${counter}`,
    name: 'Untitled Project',
    version: '1.0',
    unit: 'mm',
    room: {
      widthMm: room.widthMm,
      lengthMm: room.lengthMm,
      heightMm: room.heightMm,
      origin: { xMm: 0, yMm: 0, zMm: 0 },
    },
    items: [],
    materials: [],
    metadata: {
      createdAt: now,
      updatedAt: now,
      sourceTemplateId: templateId ?? null,
      authorNote: null,
    },
  }
}
