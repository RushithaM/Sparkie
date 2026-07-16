export interface AnimationDef {
  file: string
  frames: number
  fps: number
  loop: boolean
  next?: string
  mirror?: boolean
  effect?: 'bob' | 'squash' | 'float'
}

export interface IdleAction {
  anim: string
  weight: number
  holdMs?: number
}

export interface AvatarManifest {
  name: string
  frameSize: { w: number; h: number }
  animations: Record<string, AnimationDef>
  idleActions: IdleAction[]
}

export function validateManifest(m: AvatarManifest): AvatarManifest {
  if (!m.animations['idle']) throw new Error(`Avatar pack "${m.name}" has no idle animation`)
  for (const [id, a] of Object.entries(m.animations)) {
    if (a.frames < 1 || a.fps <= 0) throw new Error(`Animation "${id}": bad frames/fps`)
    if (a.next && !m.animations[a.next]) throw new Error(`Animation "${id}": next "${a.next}" not in pack`)
  }
  for (const act of m.idleActions) {
    if (!m.animations[act.anim]) throw new Error(`Idle action "${act.anim}" not in pack`)
  }
  return m
}
