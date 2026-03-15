import { useEffect, useRef, useState } from 'react'

interface NumericFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

const DEBOUNCE_MS = 300

export function NumericField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
}: NumericFieldProps) {
  const [localValue, setLocalValue] = useState(String(value))
  const isFocused = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync from store when not focused
  useEffect(() => {
    if (!isFocused.current) {
      setLocalValue(String(value))
    }
  }, [value])

  function commitValue(raw: string) {
    const parsed = parseFloat(raw)
    if (isNaN(parsed)) {
      setLocalValue(String(value))
      return
    }
    let clamped = parsed
    if (min != null) clamped = Math.max(min, clamped)
    if (max != null) clamped = Math.min(max, clamped)
    onChange(clamped)
    setLocalValue(String(clamped))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setLocalValue(raw)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => commitValue(raw), DEBOUNCE_MS)
  }

  function handleBlur() {
    isFocused.current = false
    if (timerRef.current) clearTimeout(timerRef.current)
    commitValue(localValue)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (timerRef.current) clearTimeout(timerRef.current)
      commitValue(localValue)
    }
  }

  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <input
        type="number"
        value={localValue}
        onChange={handleChange}
        onFocus={() => { isFocused.current = true }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        step={step}
        disabled={disabled}
        className="rounded border border-input bg-background px-2 py-1 text-xs text-foreground disabled:opacity-50"
      />
    </label>
  )
}
