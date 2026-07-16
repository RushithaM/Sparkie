import type { AvatarManifest } from './manifest'

const SCALE = 0.6

export function Avatar({
  manifest,
  anim,
  onClick,
  onEnded
}: {
  manifest: AvatarManifest
  anim: string
  onClick: () => void
  onEnded: () => void
}) {
  const def = manifest.animations[anim] ?? manifest.animations['idle']
  const { w, h } = manifest.frameSize
  const durS = def.frames / def.fps

  return (
    <div
      className={`no-drag relative cursor-pointer ${def.effect ? `animate-${def.effect}` : ''}`}
      style={{ width: w * SCALE, height: h * SCALE }}
      onClick={onClick}
    >
      {anim === 'sleep' && (
        <div className="absolute -top-4 right-2 z-10 text-2xl text-sky-300 animate-float select-none">z z</div>
      )}
      <div style={{ width: w, height: h, transform: `scale(${SCALE})`, transformOrigin: 'top left' }}>
        <div
          key={anim}
          onAnimationEnd={() => {
            if (!def.loop) onEnded()
          }}
          style={{
            width: w,
            height: h,
            backgroundImage: `url(avatars/${manifest.name}/${def.file})`,
            transform: def.mirror ? 'scaleX(-1)' : undefined,
            // 1-frame anims use a no-op animation purely for onAnimationEnd timing
            animation:
              def.frames > 1
                ? `sprite-play ${durS}s steps(${def.frames}) ${def.loop ? 'infinite' : '1'}`
                : `sprite-hold ${durS}s ${def.loop ? 'infinite' : '1'}`,
            ['--strip-end' as string]: `-${def.frames * w}px`
          }}
        />
      </div>
    </div>
  )
}
