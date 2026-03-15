export interface Dimensions {
  widthMm: number
  heightMm: number
  depthMm: number
  thicknessMm: number
}

export interface Template {
  id: string
  code: string
  name: string
  category: 'project_template' | 'module'
  previewImageUrl: string | null
  rootItemTreeDto: Record<string, unknown>
  defaultDimensions: Dimensions
  tags: string[]
}

export interface TemplatesResponse {
  items: Template[]
  traceId: string
}

export interface RoomSize {
  widthMm: number
  lengthMm: number
  heightMm: number
}

export interface ApiMaterial {
  id: string
  code: string
  name: string
  color: string
  textureUrl: string | null
  thicknessMmDefault: number
  grainDirection: string | null
  category: string
}

export interface MaterialsResponse {
  items: ApiMaterial[]
  traceId: string
}

export interface ModulesResponse {
  items: Template[]
  traceId: string
}
