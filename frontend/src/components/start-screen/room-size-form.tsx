import type { RoomSize } from '@/types/api'

interface RoomSizeFormProps {
  value: RoomSize
  onChange: (value: RoomSize) => void
}

function Field({
  label,
  name,
  value,
  onChange,
}: {
  label: string
  name: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type="number"
        name={name}
        min={100}
        max={20000}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
      />
    </label>
  )
}

export function RoomSizeForm({ value, onChange }: RoomSizeFormProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-semibold">Room dimensions (mm)</legend>
      <div className="grid grid-cols-3 gap-3">
        <Field
          label="Width"
          name="widthMm"
          value={value.widthMm}
          onChange={(v) => onChange({ ...value, widthMm: v })}
        />
        <Field
          label="Length"
          name="lengthMm"
          value={value.lengthMm}
          onChange={(v) => onChange({ ...value, lengthMm: v })}
        />
        <Field
          label="Height"
          name="heightMm"
          value={value.heightMm}
          onChange={(v) => onChange({ ...value, heightMm: v })}
        />
      </div>
    </fieldset>
  )
}
