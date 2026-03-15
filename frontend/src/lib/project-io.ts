import type { Project } from '@/types/project'

export function exportProjectJson(project: Project): void {
  const json = JSON.stringify(project, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name || 'project'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

export async function importProjectJson(
  file: File,
): Promise<{ project: Project; warnings: string[] }> {
  const text = await readFileAsText(file)
  const raw: unknown = JSON.parse(text)
  const warnings: string[] = []

  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid project file: not a JSON object.')
  }

  const obj = raw as Record<string, unknown>

  // Required fields check
  for (const field of ['id', 'name', 'version', 'room', 'items', 'materials', 'metadata']) {
    if (!(field in obj)) {
      throw new Error(`Invalid project file: missing required field "${field}".`)
    }
  }

  // Version check
  if (obj.version !== '1.0') {
    warnings.push(
      `Unsupported project version: ${String(obj.version)}. Expected "1.0".`,
    )
  }

  return { project: obj as unknown as Project, warnings }
}
