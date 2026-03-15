import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api-client'
import type { Template, TemplatesResponse } from '@/types/api'

export function useTemplates() {
  return useQuery<TemplatesResponse, Error, Template[]>({
    queryKey: ['templates'],
    queryFn: () => apiFetch<TemplatesResponse>('/templates'),
    staleTime: 5 * 60 * 1000,
    select: (data) =>
      data.items.filter((t) => t.category === 'project_template'),
  })
}
