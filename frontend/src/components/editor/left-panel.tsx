import { useProjectStore } from '@/store/project-store'

import { CustomPanelForm } from './library/custom-panel-form'
import { MaterialsTab } from './library/materials-tab'
import { ModulesTab } from './library/modules-tab'
import { PartsTab } from './library/parts-tab'
import { TemplatesTab } from './library/templates-tab'
import { ProjectTree } from './project-tree/project-tree'

const TABS = [
  { id: 'templates', label: 'Templates' },
  { id: 'modules', label: 'Modules' },
  { id: 'parts', label: 'Parts' },
  { id: 'materials', label: 'Materials' },
  { id: 'custom-panel', label: 'Custom' },
  { id: 'tree', label: 'Tree' },
] as const

export function LeftPanel() {
  const activeTab = useProjectStore((s) => s.activeTab)
  const setActiveTab = useProjectStore((s) => s.setActiveTab)

  return (
    <aside className="flex flex-col overflow-hidden border-r border-border bg-card">
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-1 py-2 text-[10px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'templates' && <TemplatesTab />}
        {activeTab === 'modules' && <ModulesTab />}
        {activeTab === 'parts' && <PartsTab />}
        {activeTab === 'materials' && <MaterialsTab />}
        {activeTab === 'custom-panel' && <CustomPanelForm />}
        {activeTab === 'tree' && <ProjectTree />}
      </div>
    </aside>
  )
}
