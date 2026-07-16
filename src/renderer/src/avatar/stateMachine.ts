export type AvatarState = 'idle' | 'wave' | 'happy' | 'sleep'

export type AvatarEvent =
  | 'reminder-due'
  | 'reminder-completed'
  | 'idle-timeout'
  | 'interact'
  | 'animation-done'

export function next(state: AvatarState, event: AvatarEvent): AvatarState {
  switch (event) {
    case 'reminder-due':
      return 'wave'
    case 'reminder-completed':
      return 'happy'
    case 'interact':
      return 'idle'
    case 'animation-done':
      return state === 'wave' || state === 'happy' ? 'idle' : state
    case 'idle-timeout':
      return state === 'idle' ? 'sleep' : state
  }
}
