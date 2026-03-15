import { PropertyPanel } from './properties/property-panel'

export function RightPanel() {
  return (
    <aside className="overflow-y-auto border-l border-border bg-card">
      <PropertyPanel />
    </aside>
  )
}
