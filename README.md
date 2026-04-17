# 🕹️ Bird Game 3: Peck Gauntlet

A fast-paced browser arcade game where you play as a pigeon and battle 9 increasingly dangerous birds in a tap-battle gauntlet.

## Play

Open `docs/index.html` in any modern browser, or serve locally:

```bash
python3 -m http.server
# then open http://localhost:8000/docs/
```

No build step, no dependencies — pure HTML, CSS, and JavaScript.

## How to Play

Tap or click to fight each bird. Each opponent uses a different mechanic:

| Mechanic | Description |
|---|---|
| **Button Mash** | Tap as fast as possible |
| **Timing Strike** | Tap when the bar hits the power zone |
| **Precision Shot** | Tap the moving target |
| **Rhythm Attack** | Catch the beat as it crosses the hit zone |
| **Crossfire** | Time your shot across multiple crosshairs — risk/reward |

Defeat all 9 birds (Seagull → Flamingo → Penguin → Owl → Eagle → Hummingbird → Shoebill → Dodo → Prism Bird) to win the gauntlet.

## Project Structure

```
docs/
  index.html   — page shell
  styles.css   — canvas styling
  game.js      — all game logic (IIFE, no external dependencies)
```

## Contributing

PRs and issues welcome. The game runs fully in the browser with no toolchain — just edit `docs/game.js` and refresh.