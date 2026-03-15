import { useEffect, useState } from 'react'

import { hasAutosave as checkAutosave } from '@/lib/persistence'

export function useHasAutosave(): {
  hasAutosave: boolean
  isChecking: boolean
} {
  const [hasIt, setHasIt] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkAutosave()
      .then(setHasIt)
      .catch(() => setHasIt(false))
      .finally(() => setIsChecking(false))
  }, [])

  return { hasAutosave: hasIt, isChecking }
}
