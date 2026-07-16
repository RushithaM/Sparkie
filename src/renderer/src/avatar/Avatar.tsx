import type { AvatarState } from './stateMachine'

const bodyAnim: Record<AvatarState, string> = {
  idle: 'animate-idle-life',
  wave: 'animate-wiggle',
  happy: 'animate-bounce-big',
  sleep: 'animate-breathe-slow'
}

export function Avatar({ state, onClick }: { state: AvatarState; onClick: () => void }) {
  const asleep = state === 'sleep'
  return (
    <div className="no-drag relative flex flex-col items-center" onClick={onClick}>
      {asleep && (
        <div className="absolute -top-6 right-6 text-2xl text-sky-300 animate-float select-none">z z</div>
      )}
      <div
        className={`h-36 w-36 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 shadow-lg cursor-pointer ${bodyAnim[state]}`}
      >
        {/* face */}
        <div className="relative h-full w-full">
          {/* eyes */}
          <div className="absolute left-9 top-13 flex w-18 justify-between">
            <Eye closed={asleep} />
            <Eye closed={asleep} />
          </div>
          {/* cheeks */}
          <div className="absolute left-6 top-21 h-3 w-4 rounded-full bg-orange-500/40" />
          <div className="absolute right-6 top-21 h-3 w-4 rounded-full bg-orange-500/40" />
          {/* mouth */}
          <div
            className={`absolute left-1/2 top-22 -translate-x-1/2 border-b-4 border-orange-900 ${
              state === 'happy' ? 'h-4 w-8 rounded-b-full border-4 border-t-0 bg-orange-900/70' : 'h-2 w-5 rounded-b-full'
            }`}
          />
        </div>
      </div>
      {/* waving hand */}
      {state === 'wave' && (
        <div className="absolute -right-2 top-2 origin-bottom-left animate-wave text-4xl select-none">👋</div>
      )}
    </div>
  )
}

function Eye({ closed }: { closed: boolean }) {
  return closed ? (
    <div className="mt-2 h-1 w-5 rounded-full bg-orange-900" />
  ) : (
    <div className="animate-blink h-5 w-5 rounded-full bg-orange-950">
      <div className="ml-1 mt-1 h-1.5 w-1.5 rounded-full bg-white" />
    </div>
  )
}
