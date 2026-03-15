import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api-client'
import type { ApiMaterial, MaterialsResponse } from '@/types/api'

export function useCatalogMaterials() {
  return useQuery<MaterialsResponse, Error, ApiMaterial[]>({
    queryKey: ['materials'],
    queryFn: () => apiFetch<MaterialsResponse>('/materials'),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.items,
  })
}
