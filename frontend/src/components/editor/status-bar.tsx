import { useProjectStore } from '@/store/project-store'

export function StatusBar() {
  const lastSavedAt = useProjectStore((s) => s.lastSavedAt)
  const isDirty = useProjectStore((s) => s.isDirty)
  const persistenceAvailable = useProjectStore((s) => s.persistenceAvailable)

  return (
    <footer className="col-span-3 flex items-center gap-4 border-t border-border bg-card px-4 py-1 text-xs text-muted-foreground">
      {!persistenceAvailable && (
        <span className="text-destructive">
          Autosave unavailable: IndexedDB not supported
        </span>
      )}
      {persistenceAvailable && isDirty && <span>Unsaved changes</span>}
      {persistenceAvailable && !isDirty && lastSavedAt && (
        <span>
          Saved at {new Date(lastSavedAt).toLocaleTimeString()}
        </span>
      )}
      {persistenceAvailable && !isDirty && !lastSavedAt && <span>Ready</span>}
    </footer>
  )
}
