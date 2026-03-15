import { useEffect, useState } from 'react'

const MIN_WIDTH = 1280

export function SmallScreenWarning() {
  const [tooSmall, setTooSmall] = useState(false)

  useEffect(() => {
    const check = () => setTooSmall(window.innerWidth < MIN_WIDTH)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!tooSmall) return null

  return (
    <div
      data-testid="small-screen-warning"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-8 text-center"
    >
      <div className="max-w-md space-y-4">
        <h2 className="text-xl font-bold text-primary">
          Screen too narrow
        </h2>
        <p className="text-muted-foreground">
          This application requires a minimum screen width of {MIN_WIDTH}px.
          Please resize your browser window or use a larger display.
        </p>
      </div>
    </div>
  )
}
