import { makeColors } from './make-colors.js'

// Palette sampled from a snowy-cabin night photo:
//   night #0d1224 · navy #102648 · sky #07487b · bright blue #0d66a8
//   shadowed snow #4c7dc1 · frost #8a9ace · window glow #d87738
// Dark: the cabin night itself. Light: the same valley on a pale, snowy morning.
export const cabinColors = makeColors({
  label: 'Snowy Cabin',
  roles: {
    accent: '#2f7fd0', // clear night blue
    success: '#3f9a7a', // pine
    warning: '#d87738', // window glow
    danger: '#c8424b', // winter berry
    pro: '#7a6fd1', // aurora violet
  },
  light: {
    gray: {
      anchors: {
        'surface-0': '#dce6f3',
        'surface-1': '#e6eef8',
        'surface-2': '#f1f5fb',
        'text-primary': '#0f1e36',
        'text-secondary': '#2c3e5c',
        'text-muted': '#4a5b78',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0b1426',
        'surface-1': '#101c33',
        'surface-2': '#15233d',
        'surface-3': '#1a2946',
        'text-primary': '#eaf1fb',
        'text-secondary': '#c2d0e6',
        'text-muted': '#97a8c4',
      },
    },
  },
})

// ---- The scene: original vector art. ----
// Kept light on purpose, like the plains scene the app animates: small, about
// twenty SMIL animations shared by groups, plain shapes, and no url(), gradients,
// filters, keyTimes or CSS transforms. CSS sets colors only.
const W = 1600
const H = 900

// Small deterministic random, so the scene is the same on every load.
let seed = 7
const rnd = (): number => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}
const i = Math.round

const anim = (attr: string, values: string, dur: number, begin = 0): string =>
  `<animate attributeName="${attr}" values="${values}" dur="${dur}s"${begin ? ` begin="-${begin}s"` : ''} repeatCount="indefinite"/>`
const slide = (values: string, dur: number, begin = 0): string =>
  `<animateTransform attributeName="transform" type="translate" values="${values}" dur="${dur}s"${begin ? ` begin="-${begin}s"` : ''} repeatCount="indefinite"/>`

// Sky: a base color with darker bands toward the top.
function sky(): string {
  let out = `<rect class="sky" width="${W}" height="${H}"/>`
  for (let b = 0; b < 12; b++) {
    out += `<rect class="shade" y="${b * 45}" width="${W}" height="46" opacity="${(0.9 * (1 - b / 12)).toFixed(2)}"/>`
  }
  return out
}

// Stars in three groups, each twinkling in its own rhythm.
function stars(): string {
  let out = ''
  const rhythm: Array<[number, number]> = [[2.4, 0], [3.3, 1], [4.1, 2]]
  for (const [dur, begin] of rhythm) {
    let g = ''
    for (let n = 0; n < 13; n++) {
      g += `<circle cx="${i(rnd() * W)}" cy="${i(rnd() * H * 0.5)}" r="${(1.6 + rnd() * 2).toFixed(1)}"/>`
    }
    out += `<g>${anim('opacity', '1;.15;1', dur, begin)}${g}</g>`
  }
  return out
}

// Four-pointed sparkles in two groups that pulse.
const spark = (x: number, y: number, s: number): string => {
  const q = i(s * 0.22)
  return `<path d="M${x} ${y - s}L${x + q} ${y - q}L${x + s} ${y}L${x + q} ${y + q}L${x} ${y + s}L${x - q} ${y + q}L${x - s} ${y}L${x - q} ${y - q}Z"/>`
}

// Aurora ribbon: a wavy band whose thickness swells in the middle and tapers to
// nothing at both ends, so it has no hard edges.
function ribbon(x0: number, x1: number, y0: number, rise: number, amp: number, thick: number, phase: number): string {
  const top: string[] = []
  const bot: string[] = []
  for (let k = 0; k <= 14; k++) {
    const t = k / 14
    const x = x0 + (x1 - x0) * t
    const y = y0 - rise * t - amp * Math.sin(t * Math.PI * 2.2 + phase)
    const h = thick * Math.sin(t * Math.PI) ** 1.4
    top.push(`${i(x)} ${i(y - h)}`)
    bot.unshift(`${i(x)} ${i(y + h * 0.6)}`)
  }
  return `M${top.join('L')}L${bot.join('L')}Z`
}
function aurora(x0: number, x1: number, y0: number, rise: number, amp: number, phase: number, cls: string): string {
  return [70, 46, 26].map(th => `<path class="${cls}" d="${ribbon(x0, x1, y0, rise, amp, th, phase)}"/>`).join('')
}

function pine(x: number, base: number, h: number): string {
  const w = h * 0.42
  let out = `<rect class="trunk" x="${i(x - h * 0.03)}" y="${i(base - h * 0.12)}" width="${i(h * 0.06)}" height="${i(h * 0.12)}"/>`
  for (let t = 0; t < 3; t++) {
    const top = i(base - h + t * h * 0.25)
    const bot = i(base - h * 0.1 - (2 - t) * h * 0.2)
    const half = w * (0.55 + t * 0.22)
    const at = (k: number): number => i(top + (bot - top) * k)
    out += `<path class="pine" d="M${x} ${top}L${i(x - half)} ${bot}L${i(x + half)} ${bot}Z"/>`
    out += `<path class="cap" d="M${x} ${top}L${i(x - half * 0.45)} ${at(0.45)}L${i(x - half * 0.2)} ${at(0.38)}L${x} ${at(0.46)}L${i(x + half * 0.25)} ${at(0.36)}L${i(x + half * 0.45)} ${at(0.45)}Z"/>`
  }
  return out
}

// Flakes in two stacked copies, so a fall of one screen height loops seamlessly.
function snowLayer(cls: string, n: number, rMin: number, rMax: number, fall: number): string {
  let flakes = ''
  for (let k = 0; k < n; k++) {
    const x = i(rnd() * W)
    const y = i(rnd() * H)
    const r = i(rMin + rnd() * (rMax - rMin))
    flakes += `<circle cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${y - H}" r="${r}"/>`
  }
  return `<g class="${cls}">${slide(`0 0;0 ${H}`, fall)}${flakes}</g>`
}

// Chimney smoke: three puffs rising and fading in turn.
function smoke(): string {
  return [0, 2, 4]
    .map(
      b =>
        `<g opacity="0">${anim('opacity', '0;.8;.5;.2;0', 6, b)}${slide('0 0;-25 -60;-50 -120;-70 -180;-85 -230', 6, b)}<circle class="puff" cx="375" cy="150" r="13"/><circle class="puff" cx="388" cy="140" r="10"/></g>`,
    )
    .join('')
}

// Soft glow faked with concentric faint circles.
const glow = (cx: number, cy: number, r: number, cls: string): string =>
  [1, 0.75, 0.5, 0.3].map(k => `<circle class="${cls}" cx="${cx}" cy="${cy}" r="${i(r * k)}"/>`).join('')

// Cabin, drawn in its own coordinates and placed at the lower right.
const CABIN = `<g transform="translate(930 405) scale(.95)">
<g>${smoke()}</g>
<rect class="chimney" x="360" y="166" width="30" height="48"/>
<rect class="snowroof" x="355" y="160" width="40" height="10" rx="3"/>
<path class="wall" d="M150 250L300 170L450 250L450 395L150 395Z"/>
<path class="log" d="M150 262H450M150 281H450M150 300H450M150 319H450M150 338H450M150 357H450M150 376H450"/>
<g>${anim('opacity', '1;.6;.9;.7;1', 2.6)}<ellipse class="warm" cx="300" cy="402" rx="260" ry="40"/><ellipse class="warm" cx="300" cy="400" rx="150" ry="22"/>${glow(221, 313, 60, 'warm')}${glow(381, 313, 60, 'warm')}<rect class="win" x="190" y="285" width="62" height="56" rx="3"/><rect class="win" x="350" y="285" width="62" height="56" rx="3"/><circle class="win" cx="300" cy="222" r="14"/></g>
<path class="frame" d="M221 285v56M190 313h62M381 285v56M350 313h62"/>
<rect class="door" x="272" y="300" width="54" height="95" rx="3"/>
<path class="roof" d="M118 266L300 152L482 266L470 276L300 170L130 276Z"/>
<path class="snowroof" d="M106 262L300 140L494 262Q490 274 478 270Q470 280 460 272L300 162L140 272Q130 280 122 270Q110 274 106 262Z"/>
</g>`

// A shooting star: a short streak that crosses in the first second of each cycle.
const SHOOT = `<g opacity="0">${anim('opacity', '0;1;0;0;0;0;0;0;0;0', 10, 4)}${slide('0 0;300 135;600 270;600 270;600 270;600 270;600 270;600 270;600 270;600 270', 10, 4)}
<path class="streak" d="M480 40L700 139" stroke-width="2"/><path class="streak" d="M640 112L700 139" stroke-width="4"/></g>`

export const CABIN_SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>
.sky{fill:#11427a}.shade{fill:#040a1a}
.stars{fill:#eaf2ff}.sparks{fill:#fff}
.a1{fill:#4af0d0;opacity:.14}.a2{fill:#7c8dff;opacity:.13}
.streak{stroke:#fff;stroke-linecap:round;fill:none}
.moon{fill:#eef3ff}.halo{fill:#cfe0ff;opacity:.07}
.far{fill:#16345f}.farsnow{fill:#3b6299}
.hill{fill:#2a5591}.hill2{fill:#3d6eb0}.ground{fill:#5486c6}.groundlit{fill:#6f9ad3;opacity:.6}
.pine{fill:#081a33}.trunk{fill:#1b1410}.cap{fill:#a9c3ea}
.wall{fill:#3b2a22}.log{stroke:#2a1d17;stroke-width:3;fill:none}
.roof{fill:#2a1d17}.snowroof{fill:#dfeaff}.chimney{fill:#4a3a33}
.win{fill:#ffb75e}.frame{stroke:#3b2a22;stroke-width:5;fill:none}.door{fill:#2d1f19}
.warm{fill:#ffa04a;opacity:.1}
.puff{fill:#c5d3ea}
.snow1{fill:#fff;opacity:.9}.snow2{fill:#dbe7ff;opacity:.6}.snow3{fill:#fff;opacity:.5}
@media (prefers-color-scheme: light){
.sky{fill:#dde8f5}.shade{fill:#8fb0db;opacity:.55}
.stars,.sparks,.aurora,.shoot{display:none}
.moon{fill:#fff8e6}.halo{fill:#fffbe8;opacity:.18}
.far{fill:#9fb8da}.farsnow{fill:#eef4fc}
.hill{fill:#c9d9ee}.hill2{fill:#dfe9f6}.ground{fill:#f4f8fd}.groundlit{fill:#fff}
.pine{fill:#1f3d5f}.cap{fill:#f6f9ff}.trunk{fill:#3a2c22}
.puff,.snow1,.snow2,.snow3{fill:#fff}.snow2{opacity:.75}.snow3{opacity:.7}
.win{fill:#ffc77a}
}
</style>
${sky()}
<g class="aurora">
<g>${slide('-60 0;60 0;-60 0', 26)}${aurora(330, 1430, 300, 100, 45, 0.4, 'a1')}</g>
<g>${slide('50 0;-50 0;50 0', 34)}${aurora(520, 1560, 200, 80, 35, 2.1, 'a2')}</g>
</g>
<g class="stars">${stars()}</g>
<g class="sparks"><g>${anim('opacity', '.2;1;.2', 3)}${spark(520, 90, 16)}${spark(1270, 170, 15)}</g><g>${anim('opacity', '1;.2;1', 3.8)}${spark(1040, 70, 18)}${spark(1450, 60, 13)}${spark(420, 300, 11)}</g></g>
<g class="shoot">${SHOOT}</g>
<g>${anim('opacity', '.6;1;.6', 7)}${glow(250, 150, 160, 'halo')}<circle class="halo" cx="250" cy="150" r="70"/></g>
<circle class="moon" cx="250" cy="150" r="44"/>
<path class="far" d="M0 560L120 470L210 520L330 420L450 510L560 455L700 540L820 470L960 545L1080 450L1210 520L1330 440L1460 510L1600 460L1600 900L0 900Z"/>
<path class="farsnow" d="M330 420L300 445L318 442L332 452L346 440L366 448ZM1080 450L1052 474L1070 470L1084 480L1098 468L1114 476ZM1330 440L1300 466L1320 462L1334 472L1350 460L1366 468ZM120 470L96 488L112 486L124 494L136 484L150 490Z"/>
<path class="hill" d="M0 640Q260 560 520 630T1040 620T1600 600L1600 900L0 900Z"/>
<path class="hill2" d="M0 720Q300 650 640 715T1240 700T1600 690L1600 900L0 900Z"/>
${pine(70, 690, 300)}${pine(170, 715, 230)}${pine(1560, 690, 260)}${pine(1470, 700, 180)}
<path class="ground" d="M0 790Q400 740 800 785T1600 770L1600 900L0 900Z"/>
${CABIN}
<path class="groundlit" d="M0 845Q500 815 1000 840T1600 830L1600 900L0 900Z"/>
<g>${slide('-25 0;25 0;-25 0', 11)}
${snowLayer('snow2', 24, 2, 3, 20)}
${snowLayer('snow1', 17, 4, 6, 13)}
${snowLayer('snow3', 5, 9, 12, 8)}
</g>
</svg>`
