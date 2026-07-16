import { useEffect, useRef, useState } from 'react'
import { AvatarEngine } from './engine'
import type { AvatarManifest } from './manifest'

export function useAvatar(manifest: AvatarManifest): { anim: string; engine: AvatarEngine } {
  const ref = useRef<AvatarEngine | null>(null)
  if (!ref.current) ref.current = new AvatarEngine(manifest)
  const engine = ref.current
  const [anim, setAnim] = useState(engine.current)

  useEffect(() => {
    const off = engine.onChange(setAnim)
    engine.start()
    return () => {
      off()
      engine.stop()
    }
  }, [engine])

  return { anim, engine }
}
