export interface Origin {
  xMm: number
  yMm: number
  zMm: number
}

export interface Room {
  widthMm: number
  lengthMm: number
  heightMm: number
  origin: Origin
}

export interface Dimensions {
  widthMm: number
  heightMm: number
  depthMm: number
  thicknessMm: number
}

export interface Transform {
  xMm: number
  yMm: number
  zMm: number
  rotationYDeg: 0 | 90 | 180 | 270
}

export interface Constraints {
  resizable: boolean
  editableFields: string[]
  minWidthMm: number
  maxWidthMm: number | null
  minHeightMm: number
  maxHeightMm: number | null
  minDepthMm: number
  maxDepthMm: number | null
}

export type ItemType =
  | 'assembly'
  | 'part'
  | 'panel'
  | 'shelf'
  | 'door'
  | 'drawerBlock'

export interface Item {
  id: string
  type: ItemType
  subtype: string
  name: string
  parentId: string | null
  sortIndex: number
  dimensions: Dimensions
  transform: Transform
  materialId: string | null
  grainDirection: string | null
  visibility: boolean
  locked: boolean
  constraints: Constraints | null
  sourceTemplateId: string | null
}

export interface Material {
  id: string
  code: string
  name: string
  color: string
  textureUrl: string | null
  thicknessMmDefault: number
  grainDirection: string | null
  category: string
}

export type ValidationSeverity = 'warning' | 'error'

export interface ValidationIssue {
  id: string
  severity: ValidationSeverity
  code: string
  message: string
  itemIds: string[]
  details: Record<string, unknown> | null
}

export interface ProjectMetadata {
  createdAt: string
  updatedAt: string
  sourceTemplateId: string | null
  authorNote: string | null
}

export interface Project {
  id: string
  name: string
  version: '1.0'
  unit: 'mm'
  room: Room
  items: Item[]
  materials: Material[]
  metadata: ProjectMetadata
}

export type CameraMode = 'perspective' | 'front' | 'left' | 'right' | 'top'

export interface UIState {
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  activeTab: string
  cameraMode: CameraMode
}
