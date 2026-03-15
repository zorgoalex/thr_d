import { useRef } from 'react'

import { exportProjectJson, importProjectJson } from '@/lib/project-io'
import { useProjectStore } from '@/store/project-store'

export function TopBar() {
  const project = useProjectStore((s) => s.project)
  const setProject = useProjectStore((s) => s.setProject)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    if (project) exportProjectJson(project)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { project: imported, warnings } = await importProjectJson(file)
      if (warnings.length > 0) {
        alert(warnings.join('\n'))
      }
      setProject(imported)
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`)
    }
    // Reset input so same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const room = project?.room

  return (
    <header className="col-span-3 flex items-center justify-between border-b border-border bg-card px-4 py-2">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold">thr_d</h1>
        {room && (
          <span className="text-xs text-muted-foreground">
            Room: {room.widthMm} × {room.lengthMm} × {room.heightMm} mm
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          disabled={!project}
          className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-50"
        >
          Export JSON
        </button>
        <label className="cursor-pointer rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted">
          Import JSON
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </label>
      </div>
    </header>
  )
}
