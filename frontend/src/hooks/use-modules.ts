import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api-client'
import type { ModulesResponse, Template } from '@/types/api'

export function useModules() {
  return useQuery<ModulesResponse, Error, Template[]>({
    queryKey: ['modules'],
    queryFn: () => apiFetch<ModulesResponse>('/modules'),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.items.filter((t) => !t.tags.includes('part')),
  })
}

export function useParts() {
  return useQuery<ModulesResponse, Error, Template[]>({
    queryKey: ['modules'],
    queryFn: () => apiFetch<ModulesResponse>('/modules'),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.items.filter((t) => t.tags.includes('part')),
  })
}
