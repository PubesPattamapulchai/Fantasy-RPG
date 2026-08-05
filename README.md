# Emberfall: Crown of Seven Roads

A large, dependency-free 8-bit fantasy RPG built with vanilla HTML, CSS, and JavaScript. It runs entirely in the browser and is ready to deploy with GitHub Pages.

![Emberfall concept artwork](assets/promo.png)

## Campaign length

The expanded campaign is designed for approximately **2.5–3.5 hours** for a first complete playthrough. Play time depends on exploration, optional guild quests, arena battles, gathering, weapon shopping, and combat choices.

The main story contains **40 objectives across 10 acts**, beginning in Moonmere and ending inside the Ember Crown itself.

## World

Explore 18 connected maps, including seven major settlements:

1. Moonmere Village
2. Whisperwood
3. Greymoor City
4. Greymoor Sewers
5. Dawnwatch Village
6. Stormfen Marsh
7. Ironridge City
8. Royal Star Mines
9. Sunspire City
10. Ember Dunes
11. Mirage Oasis
12. Temple of Glass
13. Frosthollow Village
14. Crystal Cavern
15. Starfall City
16. Sky Ruins
17. Ashen Citadel
18. Crown Core

Maps include detailed pixel scenery such as docks, wells, bridges, fountains, market carts, shrines, mine rails, crystals, hot springs, observatories, floating ruins, throne rooms, and crown-fire.

## Playable jobs

Choose one permanent job when starting a new adventure:

- **Vanguard** — durable physical fighter with Power Strike and War Cry
- **Arcanist** — high-mana spellcaster with Arc Bolt and Starfall
- **Ranger** — multi-hit and poison specialist with Twin Shot and Venom Arrow
- **Paladin** — defensive holy warrior with Radiant Smite and Sanctuary
- **Rogue** — critical and evasion specialist with Backstab and Smoke Veil
- **Cleric** — healing caster with Light Spear and Greater Heal
- **Spellblade** — hybrid fighter with Flame Arc and Mana Edge

Every job has different base stats, level growth, skills, and weapon compatibility.

## Weapons and progression

The game contains **29 named weapons** across swords, axes, bows, staves, maces, daggers, and rapiers. Visit weapon shops in several cities to buy, collect, equip, and compare gear.

Progression also includes:

- Experience and level growth
- Job-specific HP, MP, Attack, and Defense
- Potions and defense-piercing Crown Bombs
- Weapon inventory and equipment menu
- Herbs, ore, crystals, and shells
- Hidden lore tablets
- Local save and continue support

## Additional gameplay

- Six optional guild contracts with rewards
- Repeatable scaling arena battles in Ironridge
- Gathering nodes and hidden treasure
- Optional Crystal Cavern exploration
- Day-to-night tint cycle
- Nine boss encounters
- 26 enemy types
- A complete ending with campaign statistics


## Enhanced cinematic combat

Battles now include a more interactive action system:

- Location-specific animated battle scenes for forests, cities, mines, marshes, deserts, snowfields, sky ruins, the Citadel, and the Crown Core
- Timed basic attacks with Good, Great, and Perfect hit windows
- Enemy intent telegraphs for strikes, crushing blows, mana attacks, healing, wards, and boss catastrophes
- A stagger meter that can break enemy turns and create openings
- An action-variety combo chain with increasing damage bonuses
- A momentum gauge that unlocks a unique ultimate Roadburst for every job
- Animated lunges, impacts, slash effects, flashes, floating damage numbers, healing numbers, and boss introductions
- C, B, A, and S victory ranks with better gold rewards and possible S-rank item bonuses
- Number-key battle shortcuts and Space/Enter support for timed strikes

## Controls

- Move: Arrow keys or WASD
- Interact / advance dialogue: Space or Enter
- Gear and guild record: G
- Close menu: Escape
- Mute: M
- Battle shortcuts: 1–7 select actions; Space or Enter confirms a timed strike
- Mobile: On-screen D-pad, action button, and touch-friendly battle controls

## Run locally

Open `index.html` in a modern browser. No package installation, server, framework, or build step is required.

## Publish with GitHub Pages

1. Create a GitHub repository, such as `emberfall-rpg`.
2. Upload every file in this folder, including the hidden `.github` folder.
3. Open **Settings → Pages** in the repository.
4. Under **Build and deployment**, select **GitHub Actions**.
5. Commit or push the project to the `main` branch.

The included workflow deploys the static game automatically. The public address will use this format:

`https://YOUR-USERNAME.github.io/emberfall-rpg/`

## Customize

- Story, maps, jobs, enemies, quests, weapons, and battle rules: `game.js`
- Colors, layout, menus, and responsive design: `styles.css`
- Page metadata and interface structure: `index.html`
- Social preview artwork: `assets/promo.png`

## Save compatibility

This edition uses save format version 3. Saves from the earlier one-hour build are intentionally not imported because the world, job system, weapons, and quest structure changed substantially.

## License

MIT — modify, remix, and publish your own version.

## Graphic Upgrade Edition

This build adds enhanced pixel-art terrain shading, richer environmental props, biome ambient particles, cinematic vignette lighting, improved battle depth, glowing boss presentation, animated HUD meters, and a more polished retro display treatment. The game remains lightweight and requires no build tools.
