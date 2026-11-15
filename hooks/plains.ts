import { makeColors } from './make-colors.js'

// Palette sampled from a plains screenshot:
//   sky #a3c3fc · haze #a6b8d6 · grass #546d38 / #5c7341 · dirt #47452e · dark soil #383522
export const plainsColors = makeColors({
  label: 'Blocky Plains',
  roles: {
    accent: '#4a7fd6', // sky
    success: '#5c8a2e', // grass
    warning: '#d79a1e', // torchlight
    danger: '#c0392b', // redstone
    pro: '#8a5cc7', // amethyst
  },
  light: {
    gray: {
      anchors: {
        'surface-0': '#d9e5f5',
        'surface-1': '#e4edf9',
        'surface-2': '#eff5fc',
        'text-primary': '#1d2614',
        'text-secondary': '#3b4630',
        'text-muted': '#535d47',
      },
    },
    git: { added: '#4f7d28', removed: '#b2382a', modified: '#a8780f' },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#15190f',
        'surface-1': '#1c2115',
        'surface-2': '#23291b',
        'surface-3': '#2a3121',
        'text-primary': '#eef2e3',
        'text-secondary': '#c8d0b9',
        'text-muted': '#a1aa91',
      },
    },
    git: { added: '#86b84f', removed: '#e0675a', modified: '#e2b04a' },
  },
})

// ---- The scene: original blocky art, built from squares ----
const B = 50
const W = 1600
const H = 900
const HEIGHTS = [6, 6, 7, 7, 7, 6, 6, 5, 5, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 6, 6]

function terrain(): string {
  let out = ''
  HEIGHTS.forEach((hb, col) => {
    const x = col * B
    const top = H - hb * B
    out += `<rect class="grass" x="${x}" y="${top}" width="${B}" height="${B * 0.4}"/>`
    out += `<rect class="grass2" x="${x}" y="${top + B * 0.4}" width="${B}" height="${B * 0.2}"/>`
    for (let r = 0; r < hb; r++) {
      const y = top + B * 0.6 + r * B
      out += `<rect class="${(col + r) % 2 ? 'dirt' : 'dirt2'}" x="${x}" y="${y}" width="${B}" height="${B}"/>`
    }
  })
  return out
}

function tree(col: number): string {
  const x = col * B
  const ground = H - (HEIGHTS[col] ?? 0) * B
  let out = ''
  for (let i = 1; i <= 4; i++) out += `<rect class="log" x="${x}" y="${ground - i * B}" width="${B}" height="${B}"/>`
  const leafTop = ground - 6 * B
  for (let ry = 0; ry < 3; ry++) {
    const span = ry === 0 ? 1 : 2
    for (let dx = -span; dx <= span; dx++) {
      out += `<rect class="${(dx + ry) % 2 ? 'leaf' : 'leaf2'}" x="${x + dx * B}" y="${leafTop + ry * B}" width="${B}" height="${B}"/>`
    }
  }
  return out
}

function cloud(y: number): string {
  return `<rect x="0" y="${y + B * 0.6}" width="${6 * B}" height="${B * 0.6}"/><rect x="${B}" y="${y}" width="${3 * B}" height="${B * 0.6}"/>`
}

// Clouds drift across with SMIL, which the app's backdrop frame runs.
function drift(dur: number, begin: number): string {
  return `<animateTransform attributeName="transform" type="translate" values="-450 0;${W + 50} 0" dur="${dur}s" begin="-${begin}s" repeatCount="indefinite"/>`
}

function stars(): string {
  const pts = [
    [120, 80], [260, 150], [410, 60], [560, 190], [700, 90], [880, 140], [1010, 60],
    [1160, 200], [1300, 110], [1470, 70], [180, 260], [640, 300], [960, 280], [1380, 300],
  ]
  return pts.map(([x, y]) => `<rect class="star" x="${x}" y="${y}" width="8" height="8"/>`).join('')
}

export const PLAINS_SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>
  .sky1{fill:#8fb4f5}.sky2{fill:#a3c3fc}.sky3{fill:#b4cffb}.sky4{fill:#c4d6f2}
  .sun{fill:#fff3b0}.sunc{fill:#ffe27a}
  .moon,.star{opacity:0}
  .grass{fill:#5c7341}.grass2{fill:#546d38}.dirt{fill:#47452e}.dirt2{fill:#4f4c33}
  .log{fill:#5a4630}.leaf{fill:#4b6a2e}.leaf2{fill:#3f5c26}
  .cloud rect{fill:#ffffff;opacity:.92}.cloud2 rect{fill:#f1f5fd;opacity:.85}
  @media (prefers-color-scheme: dark){
    .sky1{fill:#0c1226}.sky2{fill:#111a33}.sky3{fill:#16213d}.sky4{fill:#1b2843}
    .sun,.sunc{opacity:0}.moon{opacity:1;fill:#e8ecf2}.star{opacity:.9;fill:#f4f6ff}
    .grass{fill:#2f3d22}.grass2{fill:#28351c}.dirt{fill:#24221a}.dirt2{fill:#2a281e}
    .log{fill:#30251a}.leaf{fill:#263719}.leaf2{fill:#1f2e14}
    .cloud rect,.cloud2 rect{fill:#3a4560;opacity:.55}
  }
</style>
<rect class="sky1" width="${W}" height="${H * 0.25}"/>
<rect class="sky2" y="${H * 0.25}" width="${W}" height="${H * 0.25}"/>
<rect class="sky3" y="${H * 0.5}" width="${W}" height="${H * 0.25}"/>
<rect class="sky4" y="${H * 0.75}" width="${W}" height="${H * 0.25}"/>
<g><animate attributeName="opacity" values=".9;.35" dur="4s" calcMode="discrete" repeatCount="indefinite"/>${stars()}</g>
<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMin meet">
  <rect class="sun" x="${W - 260}" y="60" width="140" height="140"/>
  <rect class="sunc" x="${W - 230}" y="90" width="80" height="80"/>
  <rect class="moon" x="${W - 240}" y="70" width="110" height="110"/>
</svg>
<g class="cloud">${drift(140, 0)}${cloud(90)}</g>
<g class="cloud2">${drift(200, 80)}${cloud(200)}</g>
<g class="cloud">${drift(170, 130)}${cloud(40)}</g>
${terrain()}
${tree(2)}
${tree(28)}
</svg>`
