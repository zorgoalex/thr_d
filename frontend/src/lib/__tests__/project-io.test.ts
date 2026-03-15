import { describe, expect, it } from 'vitest'

import { createEmptyProject } from '@/lib/project-factory'
import { importProjectJson } from '@/lib/project-io'

const DEFAULT_ROOM = { widthMm: 3000, lengthMm: 3000, heightMm: 2700 }

function makeFile(content: string, name = 'project.json'): File {
  const blob = new Blob([content], { type: 'application/json' })
  // jsdom File constructor supports text()
  return new File([blob], name, { type: 'application/json' })
}

describe('project-io', () => {
  it('imports a valid project file', async () => {
    const project = createEmptyProject(DEFAULT_ROOM)
    const file = makeFile(JSON.stringify(project))

    const { project: imported, warnings } = await importProjectJson(file)
    expect(imported.id).toBe(project.id)
    expect(warnings).toHaveLength(0)
  })

  it('warns on unsupported version', async () => {
    const project = createEmptyProject(DEFAULT_ROOM)
    const raw = { ...project, version: '2.0' }
    const file = makeFile(JSON.stringify(raw))

    const { warnings } = await importProjectJson(file)
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('2.0')
  })

  it('throws on malformed JSON', async () => {
    const file = makeFile('not json')
    await expect(importProjectJson(file)).rejects.toThrow()
  })

  it('throws on missing required fields', async () => {
    const file = makeFile(JSON.stringify({ id: 'test' }))
    await expect(importProjectJson(file)).rejects.toThrow('missing required field')
  })
})
