import { useSearchParams } from 'react-router-dom'

import { LeftPanel } from './left-panel'
import { RightPanel } from './right-panel'
import { StatusBar } from './status-bar'
import { TopBar } from './top-bar'
import { Viewport } from './viewport'

export function EditorShell() {
  const [params] = useSearchParams()
  const widthMm = Number(params.get('widthMm') ?? 3000)
  const lengthMm = Number(params.get('lengthMm') ?? 3000)
  const heightMm = Number(params.get('heightMm') ?? 2700)
  const templateId = params.get('templateId')

  return (
    <div className="grid h-screen grid-cols-[280px_1fr_300px] grid-rows-[auto_1fr_auto]">
      <TopBar
        roomDims={{ widthMm, lengthMm, heightMm }}
        templateId={templateId}
      />
      <LeftPanel />
      <Viewport />
      <RightPanel />
      <StatusBar />
    </div>
  )
}
