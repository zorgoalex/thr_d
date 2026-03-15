import { useProjectStore } from '@/store/project-store'

export function StatusBar() {
  const lastSavedAt = useProjectStore((s) => s.lastSavedAt)
  const isDirty = useProjectStore((s) => s.isDirty)
  const persistenceAvailable = useProjectStore((s) => s.persistenceAvailable)
  const issues = useProjectStore((s) => s.validationIssues)
  const errorCount = issues.filter((i) => i.severity === 'error').length
  const warnCount = issues.filter((i) => i.severity === 'warning').length

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
      {errorCount > 0 && <span className="text-destructive">{errorCount} error{errorCount > 1 ? 's' : ''}</span>}
      {warnCount > 0 && <span className="text-primary">{warnCount} warning{warnCount > 1 ? 's' : ''}</span>}
      {errorCount === 0 && warnCount === 0 && issues.length === 0 && <span className="text-green-500">Valid</span>}
    </footer>
  )
}
