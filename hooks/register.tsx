import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { cabinColors, CABIN_SCENE } from './cabin.js'
import { plainsColors, PLAINS_SCENE } from './plains.js'
import { MEMES } from './memes.js'

type LookId = 'cabin' | 'plains'

type Look = {
  name: string
  problems: readonly string[]
  scene: string
  alt: string
  look: ThemeSetArgs
}

const LOOKS: Record<LookId, Look> = {
  cabin: {
    name: 'Snowy Cabin',
    problems: cabinColors.problems,
    scene: CABIN_SCENE,
    alt: 'A log cabin hung with blinking New Year lights, a decorated fir with a star, presents and a snowman in a snowy valley, fireworks and snow in the night sky',
    look: { colors: cabinColors.theme, backdrop: { scene: 'cabin', glass: { blur: 16, opacity: 0.7 } } },
  },
  plains: {
    name: 'Blocky Plains',
    problems: plainsColors.problems,
    scene: PLAINS_SCENE,
    alt: 'Blocky grassy hills under a sky with drifting square clouds',
    look: { colors: plainsColors.theme, backdrop: { scene: 'plains', glass: { blur: 18, opacity: 0.72 } } },
  },
}

const DEFAULT: LookId = 'cabin'
const isLook = (v: unknown): v is LookId => v === 'cabin' || v === 'plains'

async function apply($: EngineInterface, id: LookId): Promise<string | undefined> {
  const unpainted = LOOKS[id].problems.find(line => line.startsWith("Desktop won't paint"))
  if (unpainted !== undefined) $.ui.toast(unpainted)
  const set = await $.theme.set(LOOKS[id].look)
  return set.isDrawn ? undefined : set.reason
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'look',
      description: 'Switch the landscape look: cabin or plains',
      argumentHint: 'cabin | plains',
    })
    await $.command.register({
      name: 'meme',
      description: 'Новогодний мем про то, как мы переносили тему',
    })
    const stored = await $.store.get('look')
    const reason = await apply($, isLook(stored) ? stored : DEFAULT)
    if (reason !== undefined) $.ui.status(reason)

    return next(e)
  })

  on('command.run', { command: 'meme' }, async $ => {
    const seen = await $.store.get('meme')
    const at = typeof seen === 'number' && Number.isInteger(seen) && seen >= 0 ? seen % MEMES.length : 0
    await $.store.set('meme', (at + 1) % MEMES.length)

    return { text: `${MEMES[at]}\n\n— мем ${at + 1} из ${MEMES.length}, /meme для следующего` }
  })

  on('command.run', { command: 'look' }, async ($, e) => {
    const stored = await $.store.get('look')
    const current: LookId = isLook(stored) ? stored : DEFAULT
    const asked = e.args.trim().toLowerCase()
    // No argument: flip to the other look.
    const want: LookId | undefined = asked === '' ? (current === 'cabin' ? 'plains' : 'cabin') : isLook(asked) ? asked : undefined

    if (want === undefined) {
      return { text: `Unknown look "${asked}". Try: /look cabin, /look plains` }
    }
    await $.store.set('look', want)
    const reason = await apply($, want)

    return { text: reason === undefined ? `Look: ${LOOKS[want].name}` : `Look set to ${LOOKS[want].name}, but not drawn here: ${reason}` }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    const id = e.props.scene
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || !isLook(id)) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={LOOKS[id].scene} alt={LOOKS[id].alt} isInteractive />
  })
}
