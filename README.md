# cozy-looks ❄️

Landscape themes for the Claude desktop app: a full color palette for light and dark mode plus an animated scene behind the conversation.

| Look | What you get |
| --- | --- |
| **Snowy Cabin** (default) | Deep-blue winter night: a log cabin with flickering warm windows and chimney smoke, snowy pines, falling snow, twinkling stars and sparkles, a shooting star, a drifting aurora and a glowing moon. In light mode, the same valley on a pale snowy morning. |
| **Blocky Plains** | Blocky grassy hills under a sky-blue day with drifting square clouds; at night, a square moon and blinking stars. |

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install cozy-looks --marketplace Retyung92/cozy-winter-looks
```

Answer `y` to add the marketplace, then pick a scope (user scope makes it apply everywhere).

From a shell:

```bash
claude plugin install cozy-looks --marketplace Retyung92/cozy-winter-looks
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins** → **Add marketplace** with `Retyung92/cozy-winter-looks`, then **Add plugin**.

## Use

- `/look cabin` — Snowy Cabin
- `/look plains` — Blocky Plains
- `/look` — switch to the other look

The choice is remembered across sessions. Themes and scenes are drawn by the desktop and mobile apps; the terminal keeps its own colors.

## Notes

The desktop app animates a backdrop scene only while it stays light, so the scenes use plain SVG shapes with a small number of shared SMIL animations and no gradients, filters or `url()` references.
