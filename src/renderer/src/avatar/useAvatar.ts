import { useCallback, useEffect, useState } from 'react'
import { next, type AvatarEvent, type AvatarState } from './stateMachine'

const ANIMATION_MS = 2500
const SLEEP_AFTER_MS = 60_000

export function useAvatar(): [AvatarState, (e: AvatarEvent) => void] {
  const [state, setState] = useState<AvatarState>('idle')
  const dispatch = useCallback((e: AvatarEvent) => setState((s) => next(s, e)), [])

  useEffect(() => {
    if (state === 'wave' || state === 'happy') {
      const t = setTimeout(() => dispatch('animation-done'), ANIMATION_MS)
      return () => clearTimeout(t)
    }
    if (state === 'idle') {
      const t = setTimeout(() => dispatch('idle-timeout'), SLEEP_AFTER_MS)
      return () => clearTimeout(t)
    }
    return undefined
  }, [state, dispatch])

  return [state, dispatch]
}
