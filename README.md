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

## Controls

- Move: Arrow keys or WASD
- Interact / advance dialogue: Space or Enter
- Gear and guild record: G
- Close menu: Escape
- Mute: M
- Mobile: On-screen D-pad and action button

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
