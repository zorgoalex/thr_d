import { useProjectStore } from '@/store/project-store'

export function ValidationPanel() {
  const issues = useProjectStore((s) => s.validationIssues)
  const setSelection = useProjectStore((s) => s.setSelection)

  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')

  if (issues.length === 0) {
    return (
      <div className="p-3 text-xs text-muted-foreground">
        No validation issues
      </div>
    )
  }

  return (
    <div className="space-y-1 p-3">
      {errors.length > 0 && (
        <p className="text-[10px] font-medium text-destructive">
          {errors.length} error{errors.length > 1 ? 's' : ''}
        </p>
      )}
      {warnings.length > 0 && (
        <p className="text-[10px] font-medium text-primary">
          {warnings.length} warning{warnings.length > 1 ? 's' : ''}
        </p>
      )}
      {issues.map((issue) => (
        <button
          key={issue.id}
          onClick={() => {
            if (issue.itemIds.length > 0) setSelection(issue.itemIds)
          }}
          className={`w-full rounded border px-2 py-1 text-left text-[10px] ${
            issue.severity === 'error'
              ? 'border-destructive/30 text-destructive'
              : 'border-primary/30 text-primary'
          } hover:bg-muted`}
        >
          <span className="font-medium">{issue.code}</span>
          <br />
          {issue.message}
        </button>
      ))}
    </div>
  )
}
