interface TopBarProps {
  roomDims: { widthMm: number; lengthMm: number; heightMm: number }
  templateId: string | null
}

export function TopBar({ roomDims, templateId }: TopBarProps) {
  return (
    <header className="col-span-3 flex items-center justify-between border-b border-border bg-card px-4 py-2">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold">thr_d</h1>
        <span className="text-xs text-muted-foreground">
          Room: {roomDims.widthMm} × {roomDims.lengthMm} × {roomDims.heightMm} mm
        </span>
        {templateId && (
          <span className="text-xs text-muted-foreground">
            Template: {templateId}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        Export / Views — Etap 8+
      </div>
    </header>
  )
}
