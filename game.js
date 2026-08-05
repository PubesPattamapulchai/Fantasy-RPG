(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const TILE = 40;
  const COLS = 16;
  const ROWS = 12;
  const SAVE_KEY = 'emberfall-save-v3';
  const FINAL_STAGE = 39;

  const ui = {
    title: document.getElementById('titleScreen'), jobScreen: document.getElementById('jobScreen'), jobGrid: document.getElementById('jobGrid'),
    start: document.getElementById('startBtn'), continueBtn: document.getElementById('continueBtn'),
    dialogue: document.getElementById('dialogueBox'), speaker: document.getElementById('speakerName'), dialogueText: document.getElementById('dialogueText'), dialogueNext: document.getElementById('dialogueNext'),
    battle: document.getElementById('battleScreen'), battleLog: document.getElementById('battleLog'), enemyName: document.getElementById('enemyName'), enemyHpText: document.getElementById('enemyHpText'), enemyHpBar: document.getElementById('enemyHpBar'), enemySprite: document.getElementById('enemySprite'), enemyStatus: document.getElementById('enemyStatusText'),
    battleHero: document.getElementById('battleHero'), heroStatus: document.getElementById('heroStatusText'), enemyIntent: document.getElementById('enemyIntent'), comboText: document.getElementById('comboText'), momentumText: document.getElementById('momentumText'), momentumBar: document.getElementById('momentumBar'), staggerBar: document.getElementById('staggerBar'), burstBtn: document.getElementById('burstBtn'), battleFx: document.getElementById('battleFx'), battleFlash: document.getElementById('battleFlash'), timingPanel: document.getElementById('timingPanel'), timingTrack: document.getElementById('timingTrack'), timingCursor: document.getElementById('timingCursor'), timingHit: document.getElementById('timingHitBtn'),
    skill1: document.getElementById('skill1Btn'), skill2: document.getElementById('skill2Btn'),
    gear: document.getElementById('gearScreen'), gearBtn: document.getElementById('gearBtn'), gearClose: document.getElementById('gearCloseBtn'), weaponGrid: document.getElementById('weaponGrid'), jobDetails: document.getElementById('jobDetails'), sideQuestList: document.getElementById('sideQuestList'), loreText: document.getElementById('loreText'),
    shop: document.getElementById('shopScreen'), shopTitle: document.getElementById('shopTitle'), shopCopy: document.getElementById('shopCopy'), shopItems: document.getElementById('shopItems'), shopClose: document.getElementById('shopCloseBtn'),
    ending: document.getElementById('endingScreen'), endingText: document.getElementById('endingText'), endingStats: document.getElementById('endingStats'), explore: document.getElementById('exploreBtn'),
    toast: document.getElementById('toast'), log: document.getElementById('adventureLog'), sound: document.getElementById('soundBtn'), save: document.getElementById('saveBtn'), reset: document.getElementById('resetBtn'), action: document.getElementById('actionBtn'),
    locationBadge: document.getElementById('locationBadge'), locationText: document.getElementById('locationText'), locationSubtext: document.getElementById('locationSubtext'), playTime: document.getElementById('playTimeText')
  };

  const JOBS = {
    vanguard: { name: 'Vanguard', desc: 'A durable front-line fighter with crushing physical attacks.', hp: 50, mp: 12, attack: 7, defense: 4, starter: 'travelerBlade', weapons: ['sword', 'axe'], skills: [{ name: 'Power Strike', cost: 4, desc: 'Heavy weapon damage.' }, { name: 'War Cry', cost: 7, desc: 'Damage, then raises Attack.' }], colors: ['#6a3822', '#efb17c', '#345f9c', '#65b7e8'] },
    arcanist: { name: 'Arcanist', desc: 'A high-mana spellcaster specializing in elemental damage.', hp: 34, mp: 26, attack: 4, defense: 1, starter: 'ashwoodStaff', weapons: ['staff'], skills: [{ name: 'Arc Bolt', cost: 4, desc: 'Reliable magic damage.' }, { name: 'Starfall', cost: 9, desc: 'Massive magic damage with burn.' }], colors: ['#362543', '#e5a779', '#68458a', '#b68cff'] },
    ranger: { name: 'Ranger', desc: 'A swift hunter using multi-hit attacks and poison arrows.', hp: 40, mp: 18, attack: 6, defense: 2, starter: 'hunterBow', weapons: ['bow'], skills: [{ name: 'Twin Shot', cost: 4, desc: 'Two fast attacks.' }, { name: 'Venom Arrow', cost: 7, desc: 'Damage plus poison.' }], colors: ['#704425', '#e8aa78', '#356b43', '#83cf69'] },
    paladin: { name: 'Paladin', desc: 'A holy defender who combines steel, healing, and protection.', hp: 48, mp: 18, attack: 6, defense: 5, starter: 'oakMace', weapons: ['mace', 'sword'], skills: [{ name: 'Radiant Smite', cost: 5, desc: 'Holy damage that pierces armor.' }, { name: 'Sanctuary', cost: 8, desc: 'Heal and guard the next blow.' }], colors: ['#c6b78c', '#e8ac7c', '#526b8f', '#f0d66d'] },
    rogue: { name: 'Rogue', desc: 'A critical-hit specialist with evasive tricks and lethal daggers.', hp: 37, mp: 17, attack: 7, defense: 2, starter: 'twinKnives', weapons: ['dagger'], skills: [{ name: 'Backstab', cost: 4, desc: 'High critical chance.' }, { name: 'Smoke Veil', cost: 7, desc: 'Damage and gain evasion.' }], colors: ['#2d2830', '#dda070', '#3a3947', '#ab76c8'] },
    cleric: { name: 'Cleric', desc: 'A resilient healer whose light harms corrupted enemies.', hp: 42, mp: 24, attack: 5, defense: 3, starter: 'pilgrimMace', weapons: ['mace', 'staff'], skills: [{ name: 'Light Spear', cost: 4, desc: 'Magic damage and MP return.' }, { name: 'Greater Heal', cost: 8, desc: 'Restore a large amount of HP.' }], colors: ['#d8c7a3', '#e7aa7d', '#735d8e', '#efe6a6'] },
    spellblade: { name: 'Spellblade', desc: 'A flexible warrior who converts mana into enchanted swordplay.', hp: 43, mp: 21, attack: 6, defense: 3, starter: 'apprenticeRapier', weapons: ['sword', 'rapier', 'staff'], skills: [{ name: 'Flame Arc', cost: 5, desc: 'Weapon and magic damage.' }, { name: 'Mana Edge', cost: 8, desc: 'Strong strike that restores MP.' }], colors: ['#433044', '#e5a776', '#2f6485', '#e06d72'] }
  };

  const WEAPONS = {
    travelerBlade: { name: "Traveler's Blade", type: 'sword', power: 2, price: 0, desc: 'A dependable road-worn sword.' },
    ashwoodStaff: { name: 'Ashwood Staff', type: 'staff', power: 2, price: 0, desc: 'Warm wood that carries simple spells.' },
    hunterBow: { name: 'Hunter Bow', type: 'bow', power: 2, price: 0, desc: 'A quiet bow for patient hunters.' },
    oakMace: { name: 'Oak Mace', type: 'mace', power: 2, price: 0, desc: 'Iron-banded oak with honest weight.' },
    twinKnives: { name: 'Twin Knives', type: 'dagger', power: 2, price: 0, desc: 'Balanced blades made for quick hands.' },
    pilgrimMace: { name: "Pilgrim's Mace", type: 'mace', power: 2, price: 0, desc: 'A temple weapon engraved with dawn prayers.' },
    apprenticeRapier: { name: "Apprentice Rapier", type: 'rapier', power: 2, price: 0, desc: 'A slender blade with a copper rune.' },
    ironSword: { name: 'Iron Sword', type: 'sword', power: 5, price: 45, minStage: 1, desc: 'Moonmere iron, sharp and forgiving.' },
    thornBow: { name: 'Thornbow', type: 'bow', power: 5, price: 48, minStage: 3, desc: 'Living yew that hums near monsters.' },
    witchHazelStaff: { name: 'Witch-Hazel Staff', type: 'staff', power: 5, price: 48, minStage: 3, desc: 'A forest focus rich in green mana.' },
    duskSabre: { name: 'Dusk Sabre', type: 'sword', power: 8, price: 90, minStage: 7, desc: 'Forged beside Greymoor’s violet wells.' },
    nightfang: { name: 'Nightfang Daggers', type: 'dagger', power: 8, price: 92, minStage: 7, desc: 'Blackened blades that disappear in shadow.' },
    gloomrod: { name: 'Gloomrod', type: 'staff', power: 8, price: 92, minStage: 7, desc: 'A crystal rod fed by dusk energy.' },
    ironwoodBow: { name: 'Ironwood Longbow', type: 'bow', power: 8, price: 92, minStage: 7, desc: 'A city bow reinforced with dark steel.' },
    forgeAxe: { name: 'Ironridge War Axe', type: 'axe', power: 11, price: 145, minStage: 14, desc: 'A broad axe quenched in mountain snow.' },
    royalHammer: { name: 'Royal Dawn Hammer', type: 'mace', power: 11, price: 145, minStage: 14, desc: 'A ceremonial hammer rebuilt for war.' },
    runeblade: { name: 'Runeblade', type: 'sword', power: 12, price: 165, minStage: 16, desc: 'Ore-runes flare whenever danger approaches.' },
    sunScepter: { name: 'Sunspire Scepter', type: 'staff', power: 14, price: 220, minStage: 18, desc: 'A golden focus carrying stored daylight.' },
    phoenixBow: { name: 'Phoenix Bow', type: 'bow', power: 14, price: 220, minStage: 18, desc: 'Its arrows trail sparks across the dunes.' },
    glassDaggers: { name: 'Glass Daggers', type: 'dagger', power: 14, price: 220, minStage: 18, desc: 'Transparent edges cut before they are seen.' },
    mirageRapier: { name: 'Mirage Rapier', type: 'rapier', power: 15, price: 245, minStage: 22, desc: 'A blade that seems one step ahead of its wielder.' },
    frostbell: { name: 'Frostbell Mace', type: 'mace', power: 17, price: 310, minStage: 26, desc: 'Each strike rings like ice on a mountain lake.' },
    glacierAxe: { name: 'Glacier Axe', type: 'axe', power: 17, price: 310, minStage: 26, desc: 'A blue-steel axe with a frozen edge.' },
    winterbow: { name: 'Winterwind Bow', type: 'bow', power: 17, price: 310, minStage: 26, desc: 'Its string never stiffens in the cold.' },
    starcaller: { name: 'Starcaller Staff', type: 'staff', power: 20, price: 420, minStage: 30, desc: 'A black staff capped with a moving constellation.' },
    cometBlade: { name: 'Comet Blade', type: 'sword', power: 20, price: 420, minStage: 30, desc: 'Meteor metal shaped into a silver flame.' },
    seraphMaul: { name: 'Seraph Maul', type: 'mace', power: 20, price: 420, minStage: 30, desc: 'A radiant hammer from Starfall’s high chapel.' },
    voidKnives: { name: 'Void Knives', type: 'dagger', power: 20, price: 420, minStage: 30, desc: 'Twin blades that drink the light around them.' },
    crownkeeper: { name: 'Crownkeeper', type: 'rapier', power: 23, price: 560, minStage: 34, desc: 'The last royal dueling blade, made to command flame.' }
  };

  const ENEMY_TYPES = {
    mossSlime: { name: 'Moss Slime', hp: 25, attack: 6, exp: 14, gold: [7, 12], sprite: 'slime', intro: 'A crown-marked Moss Slime bubbles from the grass!' },
    thornWolf: { name: 'Thorn Wolf', hp: 42, attack: 8, exp: 23, gold: [10, 17], sprite: 'wolf', intro: 'A Thorn Wolf lunges from the whispering brush!' },
    sewerRat: { name: 'Gloom Rat', hp: 48, attack: 9, exp: 27, gold: [12, 20], sprite: 'rat', intro: 'A giant Gloom Rat bares iron teeth!' },
    sludge: { name: 'Living Sludge', hp: 54, attack: 10, exp: 30, gold: [13, 22], sprite: 'slime', intro: 'The sewer water rises into a Living Sludge!' },
    sewerTyrant: { name: 'Sewer Tyrant', hp: 145, attack: 14, exp: 85, gold: [55, 75], sprite: 'rat boss', boss: true, intro: 'The Sewer Tyrant crashes through the floodgate!' },
    bogWisp: { name: 'Bog Wisp', hp: 60, attack: 11, exp: 34, gold: [16, 24], sprite: 'wraith', intro: 'A Bog Wisp gathers from green fire!' },
    mireToad: { name: 'Mire Toad', hp: 68, attack: 12, exp: 38, gold: [18, 27], sprite: 'beast', intro: 'A huge Mire Toad spits black water!' },
    mireHydra: { name: 'Mire Hydra', hp: 185, attack: 17, exp: 115, gold: [75, 100], sprite: 'beast boss', boss: true, intro: 'Three heads rise from the drowned shrine!' },
    caveBat: { name: 'Rune Bat', hp: 72, attack: 13, exp: 41, gold: [19, 29], sprite: 'bird', intro: 'A Rune Bat tears loose from the ceiling!' },
    oreGolem: { name: 'Ore Golem', hp: 82, attack: 15, exp: 48, gold: [22, 34], sprite: 'golem', intro: 'Broken mining tools assemble into an Ore Golem!' },
    forgeGuardian: { name: 'Forge Guardian', hp: 225, attack: 19, exp: 145, gold: [90, 120], sprite: 'golem boss', boss: true, intro: 'The ancient Forge Guardian awakens in a storm of sparks!' },
    duneScarab: { name: 'Dune Scarab', hp: 86, attack: 15, exp: 50, gold: [23, 36], sprite: 'rat', intro: 'A plated Dune Scarab bursts from the sand!' },
    sandWraith: { name: 'Sand Wraith', hp: 92, attack: 16, exp: 54, gold: [25, 38], sprite: 'wraith', intro: 'A Sand Wraith gathers from the burning wind!' },
    sunWyrm: { name: 'Sun-Eater Wyrm', hp: 265, attack: 21, exp: 175, gold: [110, 145], sprite: 'beast boss', boss: true, intro: 'The Sun-Eater Wyrm coils around the buried temple!' },
    glassSentinel: { name: 'Glass Sentinel', hp: 102, attack: 18, exp: 60, gold: [28, 43], sprite: 'golem', intro: 'A mirrored guardian splits the light into blades!' },
    prismGolem: { name: 'Prism Golem', hp: 305, attack: 23, exp: 205, gold: [130, 170], sprite: 'golem boss', boss: true, intro: 'The Prism Golem steps from the temple’s shattered heart!' },
    frostShade: { name: 'Frost Shade', hp: 112, attack: 19, exp: 66, gold: [30, 46], sprite: 'wraith', intro: 'A Frost Shade slips from the frozen mist!' },
    iceKnight: { name: 'Icebound Knight', hp: 340, attack: 25, exp: 235, gold: [150, 190], sprite: 'knight boss', boss: true, intro: 'The Icebound Knight raises a sword of black ice!' },
    crystalCrawler: { name: 'Crystal Crawler', hp: 124, attack: 21, exp: 72, gold: [34, 50], sprite: 'beast', intro: 'A crystal-backed crawler drops from the cavern wall!' },
    starHarpy: { name: 'Star Harpy', hp: 132, attack: 22, exp: 78, gold: [36, 54], sprite: 'bird', intro: 'A Star Harpy dives through the broken skybridge!' },
    tempestRoc: { name: 'Tempest Roc', hp: 385, attack: 28, exp: 270, gold: [175, 220], sprite: 'bird boss', boss: true, intro: 'The Tempest Roc blots out the stars with its wings!' },
    emberGuard: { name: 'Ember Guard', hp: 145, attack: 24, exp: 86, gold: [40, 60], sprite: 'guard', intro: 'An Ember Guard blocks the ruined hall!' },
    ashMage: { name: 'Ashen Magus', hp: 138, attack: 25, exp: 88, gold: [42, 62], sprite: 'mage', intro: 'An Ashen Magus calls crown-fire from the stones!' },
    malachar: { name: 'Malachar, Lord of Ash', hp: 440, attack: 31, exp: 330, gold: [230, 290], sprite: 'guard boss', boss: true, intro: 'Malachar lifts the broken Ember Crown. The throne hall burns!' },
    crownDevourer: { name: 'The Crown Devourer', hp: 560, attack: 34, exp: 420, gold: [350, 420], sprite: 'wraith boss', boss: true, intro: 'The hunger inside the Crown tears free of history itself!' },
    arenaChampion: { name: 'Ironridge Champion', hp: 120, attack: 18, exp: 45, gold: [28, 42], sprite: 'knight', intro: 'The arena champion salutes and charges!' }
  };

  const SIDE_QUESTS = {
    herbalHelp: { name: 'Sena’s Medicine', desc: 'Gather 5 Moon Herbs.', counter: 'herbs', goal: 5, reward: { gold: 90, exp: 70, potions: 3 } },
    sewerBounty: { name: 'Greymoor Vermin', desc: 'Defeat 6 sewer creatures.', counter: 'sewerKills', goal: 6, reward: { gold: 120, exp: 85, bombs: 2 } },
    oreForForge: { name: 'Ore for the Crown', desc: 'Gather 5 Star Ore.', counter: 'ore', goal: 5, reward: { gold: 165, exp: 110 } },
    scarabStudy: { name: 'Scarab Study', desc: 'Collect 5 Sun Shells.', counter: 'shells', goal: 5, reward: { gold: 210, exp: 135, bombs: 3 } },
    crystalSong: { name: 'The Crystal Song', desc: 'Gather 5 Frost Crystals.', counter: 'crystals', goal: 5, reward: { gold: 260, exp: 165, potions: 4 } },
    skyLore: { name: 'Lost Sky Annals', desc: 'Discover 5 lore tablets.', counter: 'lore', goal: 5, reward: { gold: 330, exp: 210, bombs: 4 } }
  };

  const SHOP_CATALOGS = {
    moonForge: ['ironSword', 'thornBow', 'witchHazelStaff'],
    greymoorArms: ['duskSabre', 'nightfang', 'gloomrod', 'ironwoodBow'],
    ironridgeForge: ['forgeAxe', 'royalHammer', 'runeblade'],
    sunspireArms: ['sunScepter', 'phoenixBow', 'glassDaggers', 'mirageRapier'],
    frostForge: ['frostbell', 'glacierAxe', 'winterbow'],
    starfallRelics: ['starcaller', 'cometBlade', 'seraphMaul', 'voidKnives', 'crownkeeper']
  };

  const locations = {
    moonmere: {
      name: 'Moonmere Village', short: 'MOONMERE VILLAGE', subtitle: 'A lakeside village of gardens, docks, and old bells.', biome: 'grass', start: { x: 2, y: 8 },
      map: ['WWWWWWWWWWWWWWWW','WGGGTTGGGGTTGGGW','WGGGBBGGGGGGBBGW','WGGGBBGPPGGGBBGW','WGGGGGGPPGGGGGGW','WTTGGGGPPGGTTGGW','WGGGGGGPPGGGGGGW','WGGTTGGPPGGTTGGW','WGGGGGGPPGGGGGGP','WGGGWWGPPGTTGGGP','WGGGWWGGGGGGGGGP','WWWWWWWWWWWWWWWW'],
      npcs: [
        { id: 'mira', x: 7, y: 5, name: 'Elder Mira', role: 'mira', colors: ['#d9d4d8','#efb988','#684b89','#ce8bea'] },
        { id: 'bram', x: 13, y: 7, name: 'Bram the Smith', role: 'weaponShop', shop: 'moonForge', colors: ['#4c271b','#c9865b','#553c31','#c95e3c'] },
        { id: 'talia', x: 13, y: 10, name: 'Captain Talia', role: 'talia', colors: ['#2e241e','#d69b6b','#314f78','#e2bd4b'] }
      ],
      chests: [{ id: 'moon-chest', x: 13, y: 1, reward: { gold: 35, potions: 2 }, text: 'A boatman’s cache holds 35 gold and two red potions.' }],
      nodes: [
        { id: 'moon-herb-1', x: 3, y: 4, type: 'herb' }, { id: 'moon-herb-2', x: 10, y: 9, type: 'herb' },
        { id: 'moon-lore', x: 2, y: 1, type: 'lore', text: 'Tablet I: The first crown was not forged. It was invited.' }
      ],
      decor: [{x:8,y:4,type:'well'},{x:4,y:8,type:'flowers'},{x:11,y:6,type:'flowers'},{x:2,y:9,type:'dock'},{x:6,y:9,type:'lamp'},{x:9,y:7,type:'bench'},{x:14,y:8,type:'sign'}],
      shrine: { x: 8, y: 6 },
      enemies: [
        { id:'moss-1',x:3,y:1,type:'mossSlime',minStage:1 },{ id:'moss-2',x:10,y:2,type:'mossSlime',minStage:1 },{ id:'moss-3',x:5,y:7,type:'mossSlime',minStage:1 },{ id:'moss-4',x:13,y:9,type:'mossSlime',minStage:1 },{ id:'moss-5',x:13,y:8,type:'mossSlime',minStage:1 }
      ],
      exits: [{ x:15,y:9,target:'whisperwood',targetPos:{x:1,y:6},minStage:3,label:'EAST ROAD',locked:'Captain Talia keeps the east road closed until Moonmere is safe.' }]
    },
    whisperwood: {
      name: 'Whisperwood', short: 'WHISPERWOOD', subtitle: 'A vast living forest crossed by bridges and ranger trails.', biome: 'forest', start:{x:1,y:6},
      map:['TTTTTTTTTTTTTTTT','TTGGGGTTGGGGGGTT','TGGTTGGGGTTGGGGT','TGGGGGGHHGGGGGGT','TGTTGGGHHGGTTGGT','TGGGGGGPPGGGGGGP','PGGGTTGPPGGTTGGT','TGGGGGGPPGGGGGGT','TGGTTGGGGGGTTGGT','TGGGGTTGGGGGGGGT','TTGGGGGGTTGGGGTT','TTTTTTTTTTTTTTTT'],
      npcs:[
        { id:'elowen',x:8,y:4,name:'Ranger Elowen',role:'elowen',colors:['#8a4c26','#e6a878','#38683c','#8bc85c'] },
        { id:'sena',x:6,y:8,name:'Herbalist Sena',role:'sideQuest',quest:'herbalHelp',colors:['#453322','#c98b69','#61518a','#9bd05b'] }
      ],
      chests:[{id:'wood-chest',x:13,y:9,reward:{gold:55,potions:2,bombs:1},text:'The ranger cache holds 55 gold, two tonics, and a smoke bomb.'}],
      nodes:[{id:'wood-herb-1',x:2,y:2,type:'herb'},{id:'wood-herb-2',x:12,y:2,type:'herb'},{id:'wood-herb-3',x:3,y:9,type:'herb'},{id:'wood-herb-4',x:12,y:8,type:'herb'},{id:'wood-lore',x:7,y:9,type:'lore',text:'Tablet II: Seven roads were laid where the crown’s sparks touched earth.'}],
      decor:[{x:7,y:3,type:'bridge'},{x:8,y:3,type:'bridge'},{x:6,y:6,type:'mushrooms'},{x:10,y:5,type:'mushrooms'},{x:4,y:4,type:'flowers'},{x:11,y:9,type:'flowers'},{x:14,y:5,type:'sign'}],
      shrine:{x:8,y:7},
      enemies:[{id:'wolf-1',x:5,y:2,type:'thornWolf',minStage:4},{id:'wolf-2',x:11,y:2,type:'thornWolf',minStage:4},{id:'wolf-3',x:2,y:7,type:'thornWolf',minStage:4},{id:'wolf-4',x:13,y:7,type:'thornWolf',minStage:4},{id:'wolf-5',x:8,y:9,type:'thornWolf',minStage:4},{id:'wolf-6',x:11,y:9,type:'thornWolf',minStage:4}],
      exits:[{x:0,y:6,target:'moonmere',targetPos:{x:14,y:9},minStage:0,label:'MOONMERE'},{x:15,y:5,target:'greymoor',targetPos:{x:1,y:9},minStage:6,label:'GREYMOOR',locked:'Thorn walls cover the city road. Elowen must reveal the safe trail.'}]
    },
    greymoor: {
      name:'Greymoor City',short:'GREYMOOR CITY',subtitle:'A rain-dark trade capital filled with canals and market lamps.',biome:'city',start:{x:1,y:9},
      map:['WWWWWWWWWWWWWWWW','WBBBCCCCCCBBBBBW','WBBBCCCCCCBBBBBW','WCCCCCCCCCCCCCCW','WCCBBBBCCBBBBCCW','WCCBBBBCCBBBBCCP','WCCCCCCCCCCCCCCW','WCCBBCCCCCCBBCCW','WCCBBCCCCCCBBCCW','PCCCCCCCCCCCCCCW','WCCCCCCCDCCCCCCW','WWWWWWWWWWWWWWWW'],
      npcs:[
        {id:'orin',x:8,y:3,name:'Mayor Orin',role:'orin',colors:['#b6a799','#d4a174','#5a4a74','#c9a44b']},
        {id:'vale',x:12,y:6,name:'Merchant Vale',role:'weaponShop',shop:'greymoorArms',colors:['#724126','#d59b70','#76552f','#d8b34f']},
        {id:'nix',x:3,y:6,name:'Alchemist Nix',role:'consumableShop',colors:['#262536','#ca8c6b','#4b3e70','#5fc7c5']},
        {id:'greymoor-board',x:13,y:9,name:'Guild Notice Board',role:'sideQuest',quest:'sewerBounty',colors:['#6b4b2c','#d2a06d','#57452f','#f0c45b']}
      ],
      chests:[{id:'city-chest',x:14,y:3,reward:{gold:70,potions:2},text:'A customs coffer contains 70 gold and two city tonics.'}],
      nodes:[{id:'grey-lore',x:2,y:3,type:'lore',text:'Tablet III: Greymoor sealed a crown-command beneath its oldest well.'}],
      decor:[{x:7,y:3,type:'fountain'},{x:8,y:3,type:'fountain'},{x:5,y:6,type:'cart'},{x:10,y:6,type:'cart'},{x:2,y:8,type:'lamp'},{x:13,y:8,type:'lamp'},{x:8,y:9,type:'statue'},{x:14,y:5,type:'sign'}],
      shrine:null,enemies:[],
      exits:[{x:0,y:9,target:'whisperwood',targetPos:{x:14,y:5},minStage:0,label:'WHISPERWOOD'},{x:8,y:10,target:'sewers',targetPos:{x:8,y:1},minStage:7,label:'SEWERS',locked:'The sewer gate is locked by order of Mayor Orin.'},{x:15,y:5,target:'dawnwatch',targetPos:{x:1,y:6},minStage:10,label:'DAWNWATCH',locked:'The eastern bridge remains quarantined while Greymoor’s wells are poisoned.'}]
    },
    sewers: {
      name:'Greymoor Sewers',short:'GREYMOOR SEWERS',subtitle:'Flooded brick passages pulsing with dusk magic.',biome:'dungeon',start:{x:8,y:1},
      map:['WWWWWWWWPWWWWWWW','WDDDDDDDDDDDDDDW','WDDWWDDDDDDWWDDW','WDDWWDDWWDDWWDDW','WDDDDDDWWDDDDDDW','WDDWWDDDDDDWWDDW','WDDWWWWDDWWWWDDW','WDDDDDDDDDDDDDDW','WDDWWDDWWDDWWDDW','WDDDDDDDDDDDDDDW','WDDDDDDDDDDDDDDW','WWWWWWWWWWWWWWWW'],
      npcs:[],chests:[{id:'sewer-cache',x:2,y:9,reward:{gold:85,potions:3,bombs:2},text:'A smuggler cache yields 85 gold, three potions, and two bombs.'}],
      nodes:[{id:'sewer-lore',x:13,y:9,type:'lore',text:'Tablet IV: Dusk was the crown’s power to remember every broken promise.'}],
      decor:[{x:2,y:4,type:'pipe'},{x:13,y:4,type:'pipe'},{x:8,y:5,type:'brazier'},{x:4,y:9,type:'barrel'},{x:11,y:9,type:'barrel'},{x:6,y:7,type:'grate'}],shrine:null,
      enemies:[{id:'rat-1',x:2,y:2,type:'sewerRat',minStage:7},{id:'sludge-1',x:13,y:2,type:'sludge',minStage:7},{id:'rat-2',x:3,y:7,type:'sewerRat',minStage:7},{id:'sludge-2',x:12,y:7,type:'sludge',minStage:7},{id:'rat-3',x:5,y:9,type:'sewerRat',minStage:7},{id:'sludge-3',x:10,y:9,type:'sludge',minStage:7},{id:'rat-4',x:9,y:4,type:'sewerRat',minStage:7},{id:'tyrant',x:8,y:10,type:'sewerTyrant',minStage:8}],
      exits:[{x:8,y:0,target:'greymoor',targetPos:{x:8,y:9},minStage:0,label:'CITY ABOVE'}]
    },
    dawnwatch: {
      name:'Dawnwatch Village',short:'DAWNWATCH',subtitle:'A hill village built around a monastery and wind-bells.',biome:'highland',start:{x:1,y:6},
      map:['MMMMMMMMMMMMMMMM','MGGGGGGPPGGGGGGM','MGGBBGGPPGGBBGGM','MGGBBGGPPGGBBGGM','MGGGGGGPPGGGGGGM','MGTTGGGPPGGTTGGP','PGGGGGGPPGGGGGGM','MGGGGGGPPGGGGGGM','MGGBBGGPPGGBBGGM','MGGBBGGGGGGBBGGM','MGGGGGGGGGGGGGGM','MMMMMMMMMMMMMMMM'],
      npcs:[{id:'ivo',x:8,y:4,name:'Brother Ivo',role:'ivo',colors:['#d8d0b7','#d9a273','#6e654b','#f1dc87']},{id:'dawn-merchant',x:10,y:8,name:'Peddler Fen',role:'consumableShop',colors:['#755032','#d49d72','#5a4937','#d7b157']}],
      chests:[{id:'dawn-chest',x:5,y:9,reward:{gold:95,potions:3},text:'A monastery offering box grants 95 gold and three blessing tonics.'}],
      nodes:[{id:'dawn-herb-1',x:3,y:4,type:'herb'},{id:'dawn-herb-2',x:11,y:4,type:'herb'},{id:'dawn-lore',x:13,y:1,type:'lore',text:'Tablet V: Dawnwatch rang seven bells when Malachar first touched the crown.'}],
      decor:[{x:8,y:3,type:'bell'},{x:4,y:6,type:'wheat'},{x:11,y:6,type:'wheat'},{x:6,y:8,type:'bench'},{x:10,y:8,type:'bench'},{x:14,y:6,type:'sign'}],shrine:{x:8,y:7},enemies:[],
      exits:[{x:0,y:6,target:'greymoor',targetPos:{x:14,y:5},minStage:0,label:'GREYMOOR'},{x:15,y:5,target:'stormfen',targetPos:{x:1,y:6},minStage:11,label:'STORMFEN',locked:'Brother Ivo has forbidden travel into the cursed marsh.'}]
    },
    stormfen: {
      name:'Stormfen Marsh',short:'STORMFEN MARSH',subtitle:'A drowned wetland lit by witchfire and broken shrines.',biome:'marsh',start:{x:1,y:6},
      map:['WWWWWWWWWWWWWWWW','WGGGWWGGGGWWGGGW','WGGGWWGGGGWWGGGW','WGGGHHGGGGHHGGGW','WTTGHHGGGGHHGTTW','WGGGPPGGGGPPGGGP','PGGGPPGGGGPPGGGW','WTTGPPGGGGPPGTTW','WGGGHHGGGGHHGGGW','WGGGWWGGGGWWGGGW','WGGGWWGGGGWWGGGW','WWWWWWWWWWWWWWWW'],
      npcs:[],chests:[{id:'fen-chest',x:13,y:9,reward:{gold:110,potions:3,bombs:2},text:'A half-sunken pilgrim chest holds 110 gold and marsh supplies.'}],
      nodes:[{id:'totem-1',x:3,y:2,type:'totem'},{id:'totem-2',x:12,y:2,type:'totem'},{id:'totem-3',x:3,y:9,type:'totem'},{id:'totem-4',x:12,y:9,type:'totem'},{id:'fen-lore',x:8,y:5,type:'lore',text:'Tablet VI: The marsh remembers the prince who refused to abandon it.'}],
      decor:[{x:4,y:3,type:'bridge'},{x:5,y:3,type:'bridge'},{x:10,y:3,type:'bridge'},{x:11,y:3,type:'bridge'},{x:7,y:7,type:'mushrooms'},{x:9,y:7,type:'mushrooms'},{x:14,y:5,type:'sign'}],shrine:{x:8,y:7},
      enemies:[{id:'wisp-1',x:2,y:2,type:'bogWisp',minStage:11},{id:'toad-1',x:13,y:2,type:'mireToad',minStage:11},{id:'wisp-2',x:2,y:8,type:'bogWisp',minStage:11},{id:'toad-2',x:13,y:8,type:'mireToad',minStage:11},{id:'wisp-3',x:6,y:5,type:'bogWisp',minStage:11},{id:'toad-3',x:10,y:6,type:'mireToad',minStage:11},{id:'hydra',x:8,y:10,type:'mireHydra',minStage:12}],
      exits:[{x:0,y:6,target:'dawnwatch',targetPos:{x:14,y:5},minStage:0,label:'DAWNWATCH'},{x:15,y:5,target:'ironridge',targetPos:{x:1,y:9},minStage:14,label:'IRONRIDGE',locked:'A wall of stormwater blocks the mountain road.'}]
    },
    ironridge: {
      name:'Ironridge City',short:'IRONRIDGE CITY',subtitle:'A mountain capital of furnaces, lifts, and warrior guilds.',biome:'mountainCity',start:{x:1,y:9},
      map:['MMMMMMMMMMMMMMMM','MBBBCCCCCCBBBBBM','MBBBCCCCCCBBBBBM','MCCCCCCCCCCCCCCM','MCCBBBBCCBBBBCCM','MCCBBBBCCBBBBCCP','MCCCCCCCCCCCCCCM','MCCBBCCCCCCBBCCM','MCCBBCCCCCCBBCCM','PCCCCCCCCCCCCCCM','MCCCCCCCDCCCCCCM','MMMMMMMMMMMMMMMM'],
      npcs:[
        {id:'maela',x:8,y:3,name:'Queen Maela',role:'maela',colors:['#d9c9ad','#d8a074','#8a3f4f','#f1c85a']},
        {id:'iron-smith',x:12,y:6,name:'Master Hakon',role:'weaponShop',shop:'ironridgeForge',colors:['#4a2c20','#c98c63','#5b4335','#dd8f43']},
        {id:'arena',x:3,y:6,name:'Arena Master Kesh',role:'arena',colors:['#2b2422','#c48b64','#6c3837','#e0ad49']},
        {id:'ore-board',x:13,y:9,name:'Forge Guild Board',role:'sideQuest',quest:'oreForForge',colors:['#6b4b2c','#d2a06d','#57452f','#f0c45b']}
      ],
      chests:[{id:'ridge-chest',x:14,y:3,reward:{gold:135,potions:3,bombs:2},text:'A guild prize coffer contains 135 gold and arena supplies.'}],
      nodes:[{id:'ridge-ore-1',x:2,y:2,type:'ore'},{id:'ridge-ore-2',x:13,y:8,type:'ore'},{id:'ridge-lore',x:8,y:9,type:'lore',text:'Tablet VII: Ironridge forged the crown’s empty frame, but never its fire.'}],
      decor:[{x:7,y:3,type:'statue'},{x:8,y:3,type:'statue'},{x:5,y:6,type:'anvil'},{x:10,y:6,type:'anvil'},{x:2,y:8,type:'brazier'},{x:13,y:8,type:'brazier'},{x:14,y:5,type:'sign'}],shrine:{x:8,y:7},enemies:[],
      exits:[{x:0,y:9,target:'stormfen',targetPos:{x:14,y:5},minStage:0,label:'STORMFEN'},{x:8,y:10,target:'mines',targetPos:{x:8,y:1},minStage:15,label:'ROYAL MINES',locked:'Queen Maela has sealed the mine lift.'},{x:15,y:5,target:'sunspire',targetPos:{x:1,y:6},minStage:18,label:'SUNSPIRE',locked:'The eastern rail is closed until the royal forge is restored.'}]
    },
    mines: {
      name:'Royal Star Mines',short:'ROYAL STAR MINES',subtitle:'Deep shafts carved around veins of luminous meteor ore.',biome:'mine',start:{x:8,y:1},
      map:['WWWWWWWWPWWWWWWW','WDDDDDDDDDDDDDDW','WDDWWDDDDDDWWDDW','WDDWWDDWWDDWWDDW','WDDDDDDWWDDDDDDW','WDDWWDDDDDDWWDDW','WDDWWWWDDWWWWDDW','WDDDDDDDDDDDDDDW','WDDWWDDWWDDWWDDW','WDDDDDDDDDDDDDDW','WDDDDDDDDDDDDDDW','WWWWWWWWWWWWWWWW'],
      npcs:[],chests:[{id:'mine-chest',x:13,y:9,reward:{gold:150,potions:4,bombs:2},text:'The foreman’s lockbox holds 150 gold and deep-mine supplies.'}],
      nodes:[
        {id:'miner-1',x:2,y:2,type:'rescue'},{id:'miner-2',x:13,y:4,type:'rescue'},{id:'miner-3',x:3,y:9,type:'rescue'},
        {id:'ore-1',x:5,y:2,type:'ore'},{id:'ore-2',x:11,y:2,type:'ore'},{id:'ore-3',x:5,y:7,type:'ore'},{id:'ore-4',x:11,y:9,type:'ore'},
        {id:'mine-lore',x:8,y:5,type:'lore',text:'Tablet VIII: Star ore sings only when carried toward the north.'}
      ],
      decor:[{x:4,y:4,type:'rail'},{x:11,y:4,type:'rail'},{x:6,y:7,type:'crystal'},{x:9,y:7,type:'crystal'},{x:2,y:8,type:'cart'},{x:13,y:8,type:'cart'}],shrine:{x:8,y:7},
      enemies:[{id:'bat-1',x:6,y:2,type:'caveBat',minStage:15},{id:'golem-1',x:13,y:2,type:'oreGolem',minStage:15},{id:'bat-2',x:3,y:7,type:'caveBat',minStage:15},{id:'golem-2',x:12,y:7,type:'oreGolem',minStage:15},{id:'bat-3',x:5,y:9,type:'caveBat',minStage:15},{id:'golem-3',x:10,y:9,type:'oreGolem',minStage:15},{id:'guardian',x:8,y:10,type:'forgeGuardian',minStage:16}],
      exits:[{x:8,y:0,target:'ironridge',targetPos:{x:8,y:9},minStage:0,label:'CITY LIFT'}]
    },
    sunspire: {
      name:'Sunspire City',short:'SUNSPIRE CITY',subtitle:'A golden archive-city of canals, towers, and sun gardens.',biome:'desertCity',start:{x:1,y:6},
      map:['MMMMMMMMPMMMMMMM','MSSSSSSCCSSSSSSM','MSSBBSSCCSSBBSSM','MSSBBSSCCSSBBSSM','MSSSSSSCCSSSSSSM','MSSSCCCCCCCCSSSP','PSSSCCCCCCCCSSSM','MSSBBSSCCSSBBSSM','MSSBBSSCCSSBBSSM','MSSSSSSCCSSSSSSM','MSSSSSSCCSSSSSSM','MMMMMMMMPMMMMMMM'],
      npcs:[
        {id:'lyra',x:8,y:4,name:'Archivist Lyra',role:'lyra',colors:['#2d263f','#d89a72','#763f73','#f1c75b']},
        {id:'joren',x:12,y:9,name:'Armorer Joren',role:'weaponShop',shop:'sunspireArms',colors:['#b8a27b','#c78b61','#6f5a38','#bfc9d8']},
        {id:'scarab-board',x:3,y:9,name:'Archive Research Board',role:'sideQuest',quest:'scarabStudy',colors:['#6b4b2c','#d2a06d','#57452f','#f0c45b']}
      ],
      chests:[{id:'spire-chest',x:2,y:2,reward:{gold:175,potions:4,bombs:2},text:'A ceremonial coffer contains 175 gold and royal tonics.'}],
      nodes:[{id:'spire-lore',x:13,y:2,type:'lore',text:'Tablet IX: Sun was the crown’s power to reveal what rulers hid.'}],
      decor:[{x:7,y:5,type:'fountain'},{x:8,y:5,type:'fountain'},{x:4,y:6,type:'palm'},{x:11,y:6,type:'palm'},{x:5,y:9,type:'banner'},{x:10,y:9,type:'banner'},{x:14,y:5,type:'sign'}],shrine:{x:8,y:8},enemies:[],
      exits:[{x:0,y:6,target:'ironridge',targetPos:{x:14,y:5},minStage:0,label:'IRONRIDGE'},{x:8,y:11,target:'dunes',targetPos:{x:8,y:1},minStage:19,label:'EMBER DUNES',locked:'Lyra’s archive seal is required for the southern temple road.'},{x:15,y:5,target:'oasis',targetPos:{x:1,y:6},minStage:22,label:'MIRAGE OASIS',locked:'The eastern caravan awaits a bearer of the Sun Shard.'}]
    },
    dunes: {
      name:'Ember Dunes',short:'EMBER DUNES',subtitle:'A wide sea of sand hiding royal tombs and a buried sun temple.',biome:'desert',start:{x:8,y:1},
      map:['RRRRRRRRPRRRRRRR','RSSSSSSSSSSSSSSR','RSSRRSSSSSSRRSSR','RSSSSSSSSSSSSSSR','RSSSSRRSSRRSSSSR','RSSSSSSSSSSSSSSR','RSSRRSSSSSSRRSSR','RSSSSSSSSSSSSSSR','RSSSSRRSSRRSSSSR','RSSSSSSSSSSSSSSR','RSSSSSSSSSSSSSSR','RRRRRRRRRRRRRRRR'],
      npcs:[],chests:[{id:'dune-chest',x:13,y:9,reward:{gold:190,potions:4,bombs:3},text:'A caravan wreck yields 190 gold and desert supplies.'}],
      nodes:[
        {id:'sun-seal-1',x:2,y:3,type:'sunSeal'},{id:'sun-seal-2',x:13,y:3,type:'sunSeal'},{id:'sun-seal-3',x:3,y:8,type:'sunSeal'},{id:'sun-seal-4',x:12,y:8,type:'sunSeal'},
        {id:'shell-1',x:5,y:2,type:'shell'},{id:'shell-2',x:10,y:2,type:'shell'},{id:'shell-3',x:5,y:7,type:'shell'},{id:'shell-4',x:10,y:7,type:'shell'},{id:'shell-5',x:7,y:9,type:'shell'},
        {id:'dune-lore',x:8,y:5,type:'lore',text:'Tablet X: The Sun Shard showed Malachar the ruin his victory would cause.'}
      ],
      decor:[{x:4,y:4,type:'ruin'},{x:11,y:4,type:'ruin'},{x:6,y:6,type:'bones'},{x:9,y:6,type:'bones'},{x:8,y:9,type:'obelisk'}],shrine:{x:8,y:6},
      enemies:[{id:'scarab-1',x:6,y:2,type:'duneScarab',minStage:19},{id:'wraith-1',x:13,y:2,type:'sandWraith',minStage:19},{id:'scarab-2',x:2,y:6,type:'duneScarab',minStage:19},{id:'wraith-2',x:13,y:6,type:'sandWraith',minStage:19},{id:'scarab-3',x:4,y:9,type:'duneScarab',minStage:19},{id:'wraith-3',x:11,y:9,type:'sandWraith',minStage:19},{id:'wyrm',x:8,y:10,type:'sunWyrm',minStage:20}],
      exits:[{x:8,y:0,target:'sunspire',targetPos:{x:8,y:10},minStage:0,label:'SUNSPIRE'}]
    },
    oasis: {
      name:'Mirage Oasis',short:'MIRAGE OASIS',subtitle:'A bright caravan village wrapped around a spring of blue glass.',biome:'oasis',start:{x:1,y:6},
      map:['RRRRRRRRRRRRRRRR','RSSSSSSPPSSSSSSR','RSSBBSSPPSSBBSSR','RSSBBSSPPSSBBSSR','RSSSSSSPPSSSSSSR','RSSSWWSPPSSWWSSP','PSSSWWSPPSSWWSSR','RSSSSSSPPSSSSSSR','RSSBBSSPPSSBBSSR','RSSBBSSPPSSBBSSR','RSSSSSSPPSSSSSSR','RRRRRRRPRRRRRRRR'],
      npcs:[{id:'suri',x:8,y:4,name:'Oracle Suri',role:'suri',colors:['#423252','#dc9d72','#5b4b93','#79d7d3']},{id:'oasis-shop',x:10,y:9,name:'Caravan Master Daro',role:'consumableShop',colors:['#6d3d29','#d89a6c','#7e552e','#e0bd57']}],
      chests:[{id:'oasis-chest',x:5,y:9,reward:{gold:210,potions:5,bombs:3},text:'A caravan tithe box holds 210 gold and oasis provisions.'}],
      nodes:[{id:'oasis-herb',x:3,y:4,type:'herb'},{id:'oasis-lore',x:13,y:1,type:'lore',text:'Tablet XI: Mirage glass reflects possible futures, but never the same one twice.'}],
      decor:[{x:5,y:5,type:'palm'},{x:10,y:5,type:'palm'},{x:7,y:6,type:'fountain'},{x:8,y:6,type:'fountain'},{x:4,y:8,type:'tent'},{x:11,y:8,type:'tent'},{x:14,y:5,type:'sign'}],shrine:{x:8,y:7},enemies:[],
      exits:[{x:0,y:6,target:'sunspire',targetPos:{x:14,y:5},minStage:0,label:'SUNSPIRE'},{x:7,y:11,target:'glassTemple',targetPos:{x:8,y:1},minStage:23,label:'GLASS TEMPLE',locked:'Oracle Suri has not yet opened the mirrored stair.'},{x:15,y:5,target:'frosthollow',targetPos:{x:1,y:9},minStage:26,label:'FROST ROAD',locked:'The northern caravan road is lost inside a permanent mirage.'}]
    },
    glassTemple: {
      name:'Temple of Glass',short:'TEMPLE OF GLASS',subtitle:'A mirrored ruin where every step creates another horizon.',biome:'glass',start:{x:8,y:1},
      map:['MMMMMMMMPMMMMMMM','MDDDDDDDDDDDDDDM','MDDMMDDDDDDMMDDM','MDDMMDDMMDDMMDDM','MDDDDDDMMDDDDDDM','MDDMMDDDDDDMMDDM','MDDMMMMDDMMMMDDM','MDDDDDDDDDDDDDDM','MDDMMDDMMDDMMDDM','MDDDDDDDDDDDDDDM','MDDDDDDDDDDDDDDM','MMMMMMMMMMMMMMMM'],
      npcs:[],chests:[{id:'glass-chest',x:2,y:9,reward:{gold:235,potions:5,bombs:3},text:'A mirrored treasury grants 235 gold and prism bombs.'}],
      nodes:[{id:'mirror-1',x:2,y:2,type:'mirror'},{id:'mirror-2',x:13,y:2,type:'mirror'},{id:'mirror-3',x:3,y:8,type:'mirror'},{id:'mirror-4',x:12,y:8,type:'mirror'},{id:'glass-lore',x:8,y:5,type:'lore',text:'Tablet XII: Frost was the crown’s power to stop a command before it became law.'}],
      decor:[{x:5,y:4,type:'crystal'},{x:10,y:4,type:'crystal'},{x:6,y:7,type:'mirrorDecor'},{x:9,y:7,type:'mirrorDecor'},{x:8,y:9,type:'obelisk'}],shrine:{x:8,y:7},
      enemies:[{id:'glass-1',x:5,y:2,type:'glassSentinel',minStage:23},{id:'glass-2',x:10,y:2,type:'glassSentinel',minStage:23},{id:'glass-3',x:3,y:7,type:'glassSentinel',minStage:23},{id:'glass-4',x:12,y:7,type:'glassSentinel',minStage:23},{id:'glass-5',x:5,y:9,type:'glassSentinel',minStage:23},{id:'glass-6',x:10,y:9,type:'glassSentinel',minStage:23},{id:'prism',x:8,y:10,type:'prismGolem',minStage:24}],
      exits:[{x:8,y:0,target:'oasis',targetPos:{x:8,y:10},minStage:0,label:'OASIS'}]
    },
    frosthollow: {
      name:'Frosthollow Village',short:'FROSTHOLLOW',subtitle:'A snowbound village of blue roofs, hot springs, and watchfires.',biome:'snow',start:{x:1,y:9},
      map:['MMMMMMMMPMMMMMMM','MNNNNNNIINNNNNNM','MNNBBNNIINNBBNNM','MNNBBNNIINNBBNNM','MNNNNNNIINNNNNNM','MNNNIIIIIIIINNNP','MNNNIIIIIIIINNNM','MNNBBNNIINNBBNNM','MNNBBNNIINNBBNNM','PNNNNNNIINNNNNNM','MNNNNNNIINNNNNNM','MMMMMMMMPMMMMMMM'],
      npcs:[
        {id:'freya',x:8,y:4,name:'Warden Freya',role:'freya',colors:['#e4e7e9','#d7a17b','#42677a','#8fd9e8']},
        {id:'frost-smith',x:12,y:9,name:'Smith Ylsa',role:'weaponShop',shop:'frostForge',colors:['#e2e6e8','#d49b72','#4e6370','#8ccbd8']},
        {id:'crystal-board',x:3,y:9,name:'Winter Guild Board',role:'sideQuest',quest:'crystalSong',colors:['#6b4b2c','#d2a06d','#57452f','#f0c45b']},
        {id:'hobb',x:3,y:4,name:'Innkeeper Hobb',role:'innkeeper',colors:['#6a4b32','#d09a70','#704b35','#e0b95d']}
      ],
      chests:[{id:'frost-chest',x:13,y:2,reward:{gold:270,potions:5,bombs:3},text:'The village war chest contains 270 gold and winter draughts.'}],
      nodes:[{id:'frost-crystal-1',x:2,y:2,type:'crystalMat'},{id:'frost-crystal-2',x:13,y:8,type:'crystalMat'},{id:'frost-lore',x:2,y:8,type:'lore',text:'Tablet XIII: The Icebound Knight chose duty after the kingdom forgot his name.'}],
      decor:[{x:7,y:5,type:'hotSpring'},{x:8,y:5,type:'hotSpring'},{x:5,y:6,type:'snowman'},{x:11,y:6,type:'snowman'},{x:6,y:9,type:'brazier'},{x:10,y:9,type:'brazier'},{x:14,y:5,type:'sign'}],shrine:{x:8,y:7},
      enemies:[{id:'shade-1',x:2,y:1,type:'frostShade',minStage:27},{id:'shade-2',x:13,y:1,type:'frostShade',minStage:27},{id:'shade-3',x:2,y:6,type:'frostShade',minStage:27},{id:'shade-4',x:13,y:6,type:'frostShade',minStage:27},{id:'shade-5',x:5,y:10,type:'frostShade',minStage:27},{id:'shade-6',x:11,y:10,type:'frostShade',minStage:27},{id:'ice-knight',x:8,y:1,type:'iceKnight',minStage:28}],
      exits:[{x:0,y:9,target:'oasis',targetPos:{x:14,y:5},minStage:0,label:'OASIS'},{x:8,y:11,target:'crystalCavern',targetPos:{x:8,y:1},minStage:27,label:'CRYSTAL CAVERN'},{x:8,y:0,target:'starfall',targetPos:{x:8,y:10},minStage:30,label:'STARFALL',locked:'The aurora bridge opens only for the restored Frost Sigil.'}]
    },
    crystalCavern: {
      name:'Crystal Cavern',short:'CRYSTAL CAVERN',subtitle:'An optional frozen cavern alive with singing blue crystals.',biome:'iceCave',start:{x:8,y:1},
      map:['WWWWWWWWPWWWWWWW','WDDDDDDDDDDDDDDW','WDDWWDDDDDDWWDDW','WDDWWDDWWDDWWDDW','WDDDDDDWWDDDDDDW','WDDWWDDDDDDWWDDW','WDDWWWWDDWWWWDDW','WDDDDDDDDDDDDDDW','WDDWWDDWWDDWWDDW','WDDDDDDDDDDDDDDW','WDDDDDDDDDDDDDDW','WWWWWWWWWWWWWWWW'],
      npcs:[],chests:[{id:'crystal-chest',x:13,y:9,reward:{gold:300,potions:5,bombs:4},text:'A frozen royal cache holds 300 gold and crystal grenades.'}],
      nodes:[{id:'cavern-crystal-1',x:2,y:2,type:'crystalMat'},{id:'cavern-crystal-2',x:13,y:2,type:'crystalMat'},{id:'cavern-crystal-3',x:3,y:8,type:'crystalMat'},{id:'cavern-crystal-4',x:12,y:8,type:'crystalMat'},{id:'cavern-lore',x:8,y:5,type:'lore',text:'Tablet XIV: A crystal remembers every song sung beside it.'}],
      decor:[{x:5,y:3,type:'crystal'},{x:10,y:3,type:'crystal'},{x:6,y:7,type:'crystal'},{x:9,y:7,type:'crystal'},{x:8,y:9,type:'hotSpring'}],shrine:{x:8,y:7},
      enemies:[{id:'crawler-1',x:6,y:2,type:'crystalCrawler',minStage:27},{id:'crawler-2',x:10,y:2,type:'crystalCrawler',minStage:27},{id:'crawler-3',x:3,y:7,type:'crystalCrawler',minStage:27},{id:'crawler-4',x:12,y:7,type:'crystalCrawler',minStage:27},{id:'crawler-5',x:5,y:9,type:'crystalCrawler',minStage:27},{id:'crawler-6',x:10,y:9,type:'crystalCrawler',minStage:27}],
      exits:[{x:8,y:0,target:'frosthollow',targetPos:{x:8,y:10},minStage:0,label:'FROSTHOLLOW'}]
    },
    starfall: {
      name:'Starfall City',short:'STARFALL CITY',subtitle:'The northern observatory-city beneath a permanent aurora.',biome:'starCity',start:{x:8,y:10},
      map:['MMMMMMMMPMMMMMMM','MBBBCCCCCCBBBBBM','MBBBCCCCCCBBBBBM','MCCCCCCCCCCCCCCM','MCCBBBBCCBBBBCCM','PCCBBBBCCBBBBCCP','MCCCCCCCCCCCCCCM','MCCBBCCCCCCBBCCM','MCCBBCCCCCCBBCCM','MCCCCCCCCCCCCCCM','MCCCCCCCCCCCCCCM','MMMMMMMMPMMMMMMM'],
      npcs:[
        {id:'vey',x:8,y:3,name:'Astronomer Vey',role:'vey',colors:['#b8c3d8','#cfa078','#33486b','#83bff0']},
        {id:'star-shop',x:12,y:9,name:'Relic Smith Aster',role:'weaponShop',shop:'starfallRelics',colors:['#c3c6d4','#d29c72','#4c446f','#b697e4']},
        {id:'lore-board',x:3,y:9,name:'Academy Research Board',role:'sideQuest',quest:'skyLore',colors:['#6b4b2c','#d2a06d','#57452f','#f0c45b']}
      ],
      chests:[{id:'starfall-chest',x:14,y:3,reward:{gold:340,potions:6,bombs:4},text:'An observatory coffer contains 340 gold and comet supplies.'}],
      nodes:[{id:'star-lore-1',x:2,y:2,type:'lore',text:'Tablet XV: The stars did not predict the crown. They warned against it.'},{id:'star-lore-2',x:13,y:8,type:'lore',text:'Tablet XVI: Prince Cael hid one final command beyond the sky.'}],
      decor:[{x:7,y:3,type:'telescope'},{x:8,y:3,type:'telescope'},{x:5,y:6,type:'fountain'},{x:10,y:6,type:'fountain'},{x:2,y:5,type:'banner'},{x:13,y:5,type:'banner'},{x:8,y:9,type:'statue'}],shrine:{x:8,y:7},enemies:[],
      exits:[{x:8,y:11,target:'frosthollow',targetPos:{x:8,y:1},minStage:0,label:'FROSTHOLLOW'},{x:8,y:0,target:'skyRuins',targetPos:{x:8,y:10},minStage:31,label:'SKY RUINS',locked:'Vey has not aligned the observatory bridge.'},{x:15,y:5,target:'citadel',targetPos:{x:1,y:9},minStage:34,label:'ASHEN CITADEL',locked:'The black road will not appear without all three crown commands.'}]
    },
    skyRuins: {
      name:'Sky Ruins',short:'SKY RUINS',subtitle:'Floating royal ruins joined by narrow bridges above the clouds.',biome:'sky',start:{x:8,y:10},
      map:['WWWWWWWWHWWWWWWW','WGGGGGGHHGGGGGGW','WGGWWGGHHGGWWGGW','WGGWWGGHHGGWWGGW','WGGGGGGHHGGGGGGW','WHHHHHHHHHHHHHHW','WHHHHHHHHHHHHHHW','WGGGGGGHHGGGGGGW','WGGWWGGHHGGWWGGW','WGGGGGGHHGGGGGGW','WGGGGGGHHGGGGGGW','WWWWWWWWHWWWWWWW'],
      npcs:[],chests:[{id:'sky-chest',x:13,y:9,reward:{gold:390,potions:6,bombs:5},text:'A cloud-locked treasury grants 390 gold and storm bombs.'}],
      nodes:[{id:'star-key-1',x:2,y:2,type:'starKey'},{id:'star-key-2',x:13,y:2,type:'starKey'},{id:'star-key-3',x:3,y:8,type:'starKey'},{id:'star-key-4',x:12,y:8,type:'starKey'},{id:'sky-lore-1',x:5,y:4,type:'lore',text:'Tablet XVII: Cael split the final command among four stars.'},{id:'sky-lore-2',x:10,y:9,type:'lore',text:'Tablet XVIII: The crown obeys only one who has walked all seven roads.'}],
      decor:[{x:7,y:5,type:'bridge'},{x:8,y:5,type:'bridge'},{x:6,y:1,type:'cloud'},{x:10,y:1,type:'cloud'},{x:4,y:7,type:'ruin'},{x:11,y:7,type:'ruin'},{x:8,y:9,type:'obelisk'}],shrine:{x:8,y:7},
      enemies:[{id:'harpy-1',x:5,y:2,type:'starHarpy',minStage:31},{id:'harpy-2',x:10,y:2,type:'starHarpy',minStage:31},{id:'harpy-3',x:2,y:7,type:'starHarpy',minStage:31},{id:'harpy-4',x:13,y:7,type:'starHarpy',minStage:31},{id:'harpy-5',x:5,y:9,type:'starHarpy',minStage:31},{id:'harpy-6',x:10,y:4,type:'starHarpy',minStage:31},{id:'roc',x:8,y:1,type:'tempestRoc',minStage:32}],
      exits:[{x:8,y:11,target:'starfall',targetPos:{x:8,y:1},minStage:0,label:'STARFALL'}]
    },
    citadel: {
      name:'Ashen Citadel',short:'ASHEN CITADEL',subtitle:'The ruined royal capital where crown-fire still patrols empty halls.',biome:'citadel',start:{x:1,y:9},
      map:['WWWWWWWWPWWWWWWW','WDDDDDDDDDDDDDDW','WDDWWDDDDDDWWDDW','WDDWWDDWWDDWWDDW','WDDDDDDWWDDDDDDW','PDDWWDDDDDDWWDDW','WDDWWWWDDWWWWDDW','WDDDDDDDDDDDDDDW','WDDWWDDWWDDWWDDW','PDDDDDDDDDDDDDDW','WDDDDDDDDDDDDDDW','WWWWWWWWWWWWWWWW'],
      npcs:[{id:'cael',x:6,y:9,name:'Prince Cael',role:'cael',colors:['#c7d1dd','#b9c2cf','#4d5375','#7fc7dc']}],
      chests:[{id:'citadel-chest',x:13,y:9,reward:{gold:450,potions:7,bombs:6},text:'The last royal armory grants 450 gold and phoenix supplies.'}],
      nodes:[{id:'citadel-lore',x:2,y:2,type:'lore',text:'Tablet XIX: Malachar did not seek power. He sought a world that could never surprise him.'}],
      decor:[{x:8,y:3,type:'throne'},{x:4,y:5,type:'brazier'},{x:11,y:5,type:'brazier'},{x:6,y:7,type:'banner'},{x:10,y:7,type:'banner'},{x:8,y:9,type:'statue'}],shrine:{x:8,y:8},
      enemies:[{id:'guard-1',x:2,y:8,type:'emberGuard',minStage:35},{id:'guard-2',x:13,y:8,type:'emberGuard',minStage:35},{id:'guard-3',x:2,y:5,type:'emberGuard',minStage:35},{id:'guard-4',x:13,y:5,type:'emberGuard',minStage:35},{id:'mage-1',x:5,y:2,type:'ashMage',minStage:35},{id:'mage-2',x:10,y:2,type:'ashMage',minStage:35},{id:'guard-5',x:8,y:7,type:'emberGuard',minStage:35},{id:'malachar',x:8,y:1,type:'malachar',minStage:36}],
      exits:[{x:0,y:9,target:'starfall',targetPos:{x:14,y:5},minStage:0,label:'STARFALL'},{x:8,y:0,target:'crownCore',targetPos:{x:8,y:10},minStage:37,label:'CROWN CORE',locked:'The throne has not yet opened the passage into the Crown.'}]
    },
    crownCore: {
      name:'Crown Core',short:'CROWN CORE',subtitle:'A place outside the kingdom where every command becomes fire.',biome:'core',start:{x:8,y:10},
      map:['LLLLLLLLLLLLLLLL','LDDDDDDDDDDDDDDL','LDDLLDDDDDDLLDDL','LDDLLDDLLDDLLDDL','LDDDDDDLLDDDDDDL','LDDLLDDDDDDLLDDL','LDDLLLLDDLLLLDDL','LDDDDDDDDDDDDDDL','LDDLLDDLLDDLLDDL','LDDDDDDDDDDDDDDL','LDDDDDDDDDDDDDDL','LLLLLLLLPLLLLLLL'],
      npcs:[],chests:[{id:'core-chest',x:13,y:9,reward:{gold:600,potions:8,bombs:8},text:'The Crown’s memory offers its final reserve: 600 gold and royal elixirs.'}],
      nodes:[{id:'core-sigil-1',x:2,y:2,type:'coreSigil'},{id:'core-sigil-2',x:13,y:2,type:'coreSigil'},{id:'core-sigil-3',x:3,y:8,type:'coreSigil'}],
      decor:[{x:8,y:3,type:'crown'},{x:5,y:5,type:'flame'},{x:10,y:5,type:'flame'},{x:6,y:8,type:'obelisk'},{x:10,y:8,type:'obelisk'}],shrine:{x:8,y:7},
      enemies:[{id:'devourer',x:8,y:1,type:'crownDevourer',minStage:38}],
      exits:[{x:8,y:11,target:'citadel',targetPos:{x:8,y:1},minStage:0,label:'ASHEN CITADEL'}]
    }
  };

  const TOTAL_LORE = Object.values(locations).reduce((sum, loc) => sum + loc.nodes.filter(node => node.type === 'lore').length, 0);

  const initialSideQuests = () => Object.fromEntries(Object.keys(SIDE_QUESTS).map(id => [id, { status: 'available' }]));
  const initialState = () => ({
    started: false,
    location: 'moonmere',
    player: {
      x: 2, y: 8, facing: 'down', job: null,
      hp: 40, maxHp: 40, mp: 14, maxMp: 14,
      level: 1, exp: 0, nextExp: 38, gold: 0, potions: 3, bombs: 1,
      baseAttack: 6, defense: 2, equippedWeapon: null, weapons: [], armorTier: 0,
      attackBuffTurns: 0, evasionTurns: 0
    },
    questStage: 0,
    counters: { moss: 0, wolves: 0, sewerKills: 0, shades: 0, guards: 0, herbs: 0, ore: 0, crystals: 0, shells: 0, lore: 0, arenaWins: 0 },
    keyItems: { duskCrystals: 0, mireTotems: 0, miners: 0, sunSeals: 0, mirrorShards: 0, frostSigil: false, starKeys: 0, crownCommands: 0, coreSigils: 0 },
    sideQuests: initialSideQuests(),
    logs: [], soundOn: true, inBattle: false, battleEnemy: null, battleLocked: false, guarding: false, dialogueQueue: [], activeEnemyId: null,
    battleCombo: 0, battleMaxCombo: 0, battleMomentum: 0, battleLastAction: '', battlePerfects: 0, battleDamageTaken: 0, battleTurns: 0, timingActive: false, timingStartedAt: 0, timingDuration: 1150, timingFrame: 0,
    activeShop: null, totalBattles: 0, totalGoldEarned: 0, playSeconds: 0, endingSeen: false
  });

  let state = initialState();
  let audioCtx = null;
  let toastTimer = null;
  let lastMove = 0;
  let sessionStartedAt = Date.now();
  let lastClockSecond = -1;

  function currentLocation() { return locations[state.location]; }
  function currentJob() { return JOBS[state.player.job] || JOBS.vanguard; }
  function equippedWeapon() { return WEAPONS[state.player.equippedWeapon] || WEAPONS.travelerBlade; }
  function totalAttack() { return state.player.baseAttack + equippedWeapon().power; }
  function tileAt(x, y) { return currentLocation().map[y]?.[x] || 'W'; }
  function isEnemyVisible(enemy) { return !enemy.defeated && state.questStage >= (enemy.minStage || 0) && state.questStage <= (enemy.maxStage ?? FINAL_STAGE); }
  function isNodeVisible(node) { return !node.collected; }
  function menusOpen() { return !ui.gear.classList.contains('hidden') || !ui.shop.classList.contains('hidden') || !ui.jobScreen.classList.contains('hidden'); }

  function isBlocked(x, y) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true;
    const tile = tileAt(x, y);
    if (['W', 'T', 'B', 'R', 'M', 'L'].includes(tile)) return true;
    return currentLocation().npcs.some(npc => npc.x === x && npc.y === y);
  }

  function beep(freq = 440, duration = 0.06, type = 'square', volume = 0.035) {
    if (!state.soundOn) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type; osc.frequency.value = freq; gain.gain.value = volume;
      osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }
  function chord(notes) { notes.forEach((note, i) => setTimeout(() => beep(note, .08, 'square', .028), i * 70)); }
  function escapeHtml(text) { return String(text).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
  function randomBetween(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function showToast(message, duration = 1900) {
    ui.toast.textContent = message; ui.toast.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove('show'), duration);
  }

  function addLog(text, important = false) {
    state.logs.unshift({ text, important, time: Date.now() });
    state.logs = state.logs.slice(0, 12); renderLog();
  }

  function renderLog() {
    ui.log.innerHTML = state.logs.length
      ? state.logs.map(item => `<div class="log-item">${item.important ? '<strong>NEW</strong><br>' : ''}${escapeHtml(item.text)}</div>`).join('')
      : '<div class="log-item">Your story begins in Moonmere...</div>';
  }

  function chapterText() {
    const s = state.questStage;
    if (s <= 2) return 'PROLOGUE · THE RED STAR';
    if (s <= 5) return 'ACT I · WHISPERS IN THORNS';
    if (s <= 9) return 'ACT II · THE DUSK BELOW';
    if (s <= 13) return 'ACT III · BELLS IN THE MARSH';
    if (s <= 17) return 'ACT IV · THE MOUNTAIN FORGE';
    if (s <= 21) return 'ACT V · THE SUN COMMAND';
    if (s <= 25) return 'ACT VI · MIRRORS OF CHOICE';
    if (s <= 29) return 'ACT VII · WINTER’S NAME';
    if (s <= 33) return 'ACT VIII · THE FOURTH STAR';
    if (s <= 36) return 'ACT IX · THE ASHEN THRONE';
    if (s <= 38) return 'FINAL ACT · INSIDE THE CROWN';
    return 'EPILOGUE · SEVEN ROADS';
  }

  function questText() {
    const c = state.counters, k = state.keyItems;
    const quests = [
      'Speak to Elder Mira in Moonmere.',
      `Defeat 4 crown-marked Moss Slimes (${Math.min(c.moss,4)}/4).`,
      'Return to Elder Mira for the Wayfarer Crest.',
      'Find Ranger Elowen in Whisperwood.',
      `Defeat 5 Thorn Wolves in Whisperwood (${Math.min(c.wolves,5)}/5).`,
      'Return to Ranger Elowen.',
      'Enter Greymoor and speak to Mayor Orin.',
      `Recover 4 Dusk Crystals in the sewers (${Math.min(k.duskCrystals,4)}/4).`,
      'Defeat the Sewer Tyrant at the deepest floodgate.',
      'Return to Mayor Orin.',
      'Travel to Dawnwatch and speak to Brother Ivo.',
      `Cleanse 4 witchfire totems in Stormfen (${Math.min(k.mireTotems,4)}/4).`,
      'Defeat the Mire Hydra at the drowned shrine.',
      'Return to Brother Ivo.',
      'Meet Queen Maela in Ironridge City.',
      `Rescue 3 trapped miners in the Royal Mines (${Math.min(k.miners,3)}/3).`,
      'Defeat the Forge Guardian.',
      'Return to Queen Maela.',
      'Travel to Sunspire and speak to Archivist Lyra.',
      `Recover 4 Sun Seals in the Ember Dunes (${Math.min(k.sunSeals,4)}/4).`,
      'Defeat the Sun-Eater Wyrm.',
      'Return the Sun Command to Archivist Lyra.',
      'Travel to Mirage Oasis and speak to Oracle Suri.',
      `Align 4 mirror pylons in the Glass Temple (${Math.min(k.mirrorShards,4)}/4).`,
      'Defeat the Prism Golem.',
      'Return to Oracle Suri.',
      'Reach Frosthollow and speak to Warden Freya.',
      `Defeat 5 Frost Shades around Frosthollow (${Math.min(c.shades,5)}/5).`,
      'Defeat the Icebound Knight.',
      'Return to Warden Freya.',
      'Reach Starfall City and speak to Astronomer Vey.',
      `Recover 4 Star Keys in the Sky Ruins (${Math.min(k.starKeys,4)}/4).`,
      'Defeat the Tempest Roc.',
      'Return to Astronomer Vey.',
      'Enter the Ashen Citadel and speak to Prince Cael.',
      `Defeat 6 crown servants in the Citadel (${Math.min(c.guards,6)}/6).`,
      'Confront Malachar in the throne hall.',
      `Activate 3 command sigils inside the Crown (${Math.min(k.coreSigils,3)}/3).`,
      'Defeat the Crown Devourer.',
      'The Crown is sealed. Explore the restored kingdom.'
    ];
    return quests[state.questStage] || quests[FINAL_STAGE];
  }

  function currentPlaySeconds() {
    if (!state.started) return state.playSeconds || 0;
    return (state.playSeconds || 0) + Math.floor((Date.now() - sessionStartedAt) / 1000);
  }
  function formatTime(totalSeconds) {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(seconds / 3600), minutes = Math.floor((seconds % 3600) / 60), secs = seconds % 60;
    return hours > 0 ? `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}` : `${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  }

  function updateHud() {
    const p = state.player, job = currentJob(), weapon = equippedWeapon();
    document.getElementById('jobText').textContent = p.job ? job.name.toUpperCase() : 'WAYFARER';
    document.getElementById('weaponText').textContent = p.equippedWeapon ? weapon.name : 'Choose a job to begin';
    document.getElementById('levelText').textContent = p.level;
    document.getElementById('hpText').textContent = `${Math.max(0,p.hp)} / ${p.maxHp}`;
    document.getElementById('mpText').textContent = `${Math.max(0,p.mp)} / ${p.maxMp}`;
    document.getElementById('expText').textContent = `${p.exp} / ${p.nextExp}`;
    document.getElementById('goldText').textContent = p.gold;
    document.getElementById('potionText').textContent = p.potions;
    document.getElementById('attackText').textContent = p.equippedWeapon ? totalAttack() : p.baseAttack;
    document.getElementById('defenseText').textContent = p.defense;
    document.getElementById('herbText').textContent = cValue('herbs');
    document.getElementById('oreText').textContent = cValue('ore');
    document.getElementById('crystalText').textContent = cValue('crystals');
    document.getElementById('shellText').textContent = cValue('shells');
    document.getElementById('chapterText').textContent = chapterText();
    document.getElementById('questText').textContent = questText();
    document.getElementById('hpBar').style.width = `${Math.max(0,p.hp / Math.max(1,p.maxHp) * 100)}%`;
    document.getElementById('mpBar').style.width = `${Math.max(0,p.mp / Math.max(1,p.maxMp) * 100)}%`;
    document.getElementById('expBar').style.width = `${Math.max(0,p.exp / Math.max(1,p.nextExp) * 100)}%`;
    const progress = Math.min(100, Math.round(state.questStage / FINAL_STAGE * 100));
    document.getElementById('campaignBar').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `Story ${progress}%`;
    ui.continueBtn.disabled = !localStorage.getItem(SAVE_KEY); ui.continueBtn.style.opacity = ui.continueBtn.disabled ? '.45' : '1';
    const loc = currentLocation(); ui.locationBadge.textContent = loc.short; ui.locationText.textContent = loc.name; ui.locationSubtext.textContent = loc.subtitle;
    ui.playTime.textContent = formatTime(currentPlaySeconds());
    ui.skill1.textContent = job.skills[0].name; ui.skill2.textContent = job.skills[1].name;
    ui.loreText.textContent = `${state.counters.lore} / ${TOTAL_LORE}`;
    renderGear();
  }

  function cValue(name) { return Number(state.counters[name] || 0); }

  function resetWorld() {
    Object.values(locations).forEach(loc => {
      loc.enemies.forEach(enemy => { enemy.defeated = false; });
      loc.chests.forEach(chest => { chest.opened = false; });
      loc.nodes.forEach(node => { node.collected = false; });
    });
  }

  function drawGround(px, py, base, fleck, x, y) {
    ctx.fillStyle = base; ctx.fillRect(px, py, TILE, TILE);
    const sx = px + ((x * 7 + y * 3) % 29), sy = py + ((x * 5 + y * 11) % 29);
    ctx.fillStyle = fleck; ctx.fillRect(sx, sy, 4, 4);
    ctx.fillStyle = 'rgba(255,255,255,.055)'; ctx.fillRect(px + 2, py + 2, TILE - 4, 2);
    ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(px, py + TILE - 3, TILE, 3);
  }

  function drawTile(x, y, tile) {
    const px = x * TILE, py = y * TILE, biome = currentLocation().biome;
    if (tile === 'W') {
      if (['dungeon','mine','iceCave','citadel','core','glass'].includes(biome)) {
        const wall = biome === 'core' ? '#431b20' : biome === 'citadel' ? '#241b22' : biome === 'glass' ? '#314052' : biome === 'iceCave' ? '#274653' : '#17212b';
        ctx.fillStyle = wall; ctx.fillRect(px,py,TILE,TILE); ctx.fillStyle = biome === 'core' ? '#8d3429' : '#455668'; ctx.fillRect(px+4,py+6,31,5); ctx.fillRect(px+10,py+25,26,5);
      } else if (biome === 'sky') {
        ctx.fillStyle = '#b8d9ee'; ctx.fillRect(px,py,TILE,TILE); ctx.fillStyle = '#eff8ff'; ctx.fillRect(px+3,py+9,26,7); ctx.fillRect(px+14,py+24,23,6);
      } else {
        ctx.fillStyle = biome === 'marsh' ? '#24555a' : '#1d5c78'; ctx.fillRect(px,py,TILE,TILE); ctx.fillStyle = biome === 'marsh' ? '#34736c' : '#2a7791'; ctx.fillRect(px+4,py+9,12,3); ctx.fillRect(px+22,py+25,14,3);
      }
      return;
    }
    if (tile === 'G') drawGround(px,py,biome === 'forest' ? '#397b3d' : biome === 'sky' ? '#6fae63' : biome === 'marsh' ? '#477c49' : '#4f9847',biome === 'sky' ? '#a5d27e' : '#76b95e',x,y);
    if (tile === 'C') drawGround(px,py,biome === 'starCity' ? '#6f7891' : biome === 'mountainCity' ? '#7b746b' : '#888275',biome === 'starCity' ? '#a5b1cc' : '#aaa18e',x,y);
    if (tile === 'D') { drawGround(px,py,biome === 'core' ? '#54262a' : biome === 'citadel' ? '#3b3032' : biome === 'glass' ? '#556b7f' : biome === 'iceCave' ? '#416f7d' : '#344047',biome === 'core' ? '#d34a34' : biome === 'glass' ? '#92b6d4' : '#4d5c62',x,y); ctx.fillStyle='rgba(0,0,0,.14)';ctx.fillRect(px,py+19,TILE,3); }
    if (tile === 'S') drawGround(px,py,biome === 'oasis' ? '#d2a558' : '#c88d43','#e5b45d',x,y);
    if (tile === 'N') drawGround(px,py,'#cbdfe5','#f2fbff',x,y);
    if (tile === 'I') { drawGround(px,py,'#79b8ca','#c7f2f5',x,y); ctx.fillStyle='#5f9fb5';ctx.fillRect(px+8,py+10,19,2);ctx.fillRect(px+19,py+27,13,2); }
    if (tile === 'P') { const base = biome === 'snow' ? '#91b8c4' : ['desert','desertCity','oasis'].includes(biome) ? '#aa7c4b' : biome === 'citadel' ? '#4d3838' : '#8d8a78'; drawGround(px,py,base,'#c2bca4',x,y); }
    if (tile === 'H') { drawGround(px,py,biome === 'sky' ? '#9b8a6e' : '#684c31','#b49363',x,y); ctx.fillStyle='#3e2c21';ctx.fillRect(px,py+7,TILE,4);ctx.fillRect(px,py+29,TILE,4); }
    if (tile === 'T') { drawGround(px,py,'#397b3d','#5ca654',x,y); drawTree(px,py); }
    if (tile === 'B') { drawGround(px,py,biome === 'snow' ? '#cbdfe5' : ['desertCity','oasis'].includes(biome) ? '#c88d43' : '#4f9847','#d8b86e',x,y); drawHouse(px,py,biome); }
    if (tile === 'R') { drawGround(px,py,'#b27f41','#d7a755',x,y); drawRock(px,py,'#765238'); }
    if (tile === 'M') { drawGround(px,py,biome === 'snow' ? '#b9d2d9' : biome === 'starCity' ? '#6d7894' : '#b58447','#dfc27e',x,y); drawRock(px,py,biome === 'snow' ? '#728a94' : '#806247'); }
    if (tile === 'L') { ctx.fillStyle='#7f271e';ctx.fillRect(px,py,TILE,TILE);ctx.fillStyle='#f06b32';ctx.fillRect(px+4,py+8,26,5);ctx.fillRect(px+10,py+27,22,4); }
  }

  function drawTree(px, py) { ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(px+8,py+32,27,5);ctx.fillStyle='#4a2d1b';ctx.fillRect(px+17,py+21,7,17);ctx.fillStyle='#183f2b';ctx.fillRect(px+5,py+13,30,17);ctx.fillStyle='#246b3b';ctx.fillRect(px+8,py+8,26,17);ctx.fillStyle='#3f8f49';ctx.fillRect(px+12,py+3,18,14);ctx.fillStyle='#73bd61';ctx.fillRect(px+13,py+7,7,5);ctx.fillStyle='rgba(255,255,255,.13)';ctx.fillRect(px+10,py+11,8,3); }
  function drawRock(px, py, color) { ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(px+5,py+31,31,5);ctx.fillStyle=color;ctx.fillRect(px+7,py+15,27,20);ctx.fillStyle='#967c62';ctx.fillRect(px+12,py+9,18,12);ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(px+14,py+11,8,4);ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(px+22,py+24,10,8); }
  function drawHouse(px, py, biome) {
    const wall = biome === 'snow' ? '#75858a' : ['desertCity','oasis'].includes(biome) ? '#ad8052' : biome === 'city' ? '#69646b' : biome === 'starCity' ? '#65708b' : biome === 'mountainCity' ? '#6f6259' : '#6b3d2b';
    const roof = biome === 'snow' ? '#456c7d' : ['desertCity','oasis'].includes(biome) ? '#d29a4e' : biome === 'city' ? '#4d4555' : biome === 'starCity' ? '#3d4b72' : '#b45f36';
    ctx.fillStyle=wall;ctx.fillRect(px+3,py+15,34,22);ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(px,py+17);ctx.lineTo(px+20,py+2);ctx.lineTo(px+40,py+17);ctx.fill();
    if (biome === 'snow') {ctx.fillStyle='#eaf8fb';ctx.fillRect(px+7,py+7,26,5);} ctx.fillStyle='#2a1e1c';ctx.fillRect(px+17,py+24,8,13);ctx.fillStyle='#f2cf67';ctx.fillRect(px+7,py+23,6,6);
  }

  function drawCharacter(x, y, colors, facing = 'down', ghost = false) {
    const px=x*TILE+10, py=y*TILE+5; ctx.save(); if(ghost)ctx.globalAlpha=.68+Math.sin(Date.now()/360)*.12;
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(px+4,py+29,20,5);ctx.fillStyle=colors[0];ctx.fillRect(px+6,py,16,10);ctx.fillRect(px+3,py+6,22,8);ctx.fillStyle=colors[1];ctx.fillRect(px+6,py+10,16,10);
    ctx.fillStyle='#172033'; if(facing==='left')ctx.fillRect(px+7,py+13,3,3);else if(facing==='right')ctx.fillRect(px+18,py+13,3,3);else{ctx.fillRect(px+8,py+13,3,3);ctx.fillRect(px+17,py+13,3,3);} ctx.fillStyle=colors[2];ctx.fillRect(px+4,py+20,20,11);ctx.fillStyle=colors[3];ctx.fillRect(px+4,py+20,20,4);ctx.fillStyle='#2b2631';ctx.fillRect(px+6,py+31,6,4);ctx.fillRect(px+16,py+31,6,4);ctx.restore();
  }

  function drawEnemy(enemy) {
    if(!isEnemyVisible(enemy))return; const type=ENEMY_TYPES[enemy.type],px=enemy.x*TILE+7,py=enemy.y*TILE+10,pulse=Math.floor(Date.now()/350)%2;
    const palettes={mossSlime:['#69c759','#a1ed79'],thornWolf:['#4d7047','#83a56e'],sewerRat:['#765d69','#b494a1'],sludge:['#69715a','#9dab70'],sewerTyrant:['#705462','#c7939f'],bogWisp:['#48a47a','#88e8af'],mireToad:['#55794b','#90bd73'],mireHydra:['#3f7652','#77c77a'],caveBat:['#556183','#92a8c8'],oreGolem:['#78684f','#c4a56f'],forgeGuardian:['#6f5543','#e19a51'],duneScarab:['#8f6535','#d6aa55'],sandWraith:['#7a63a8','#b89ce1'],sunWyrm:['#a46638','#e3ba62'],glassSentinel:['#6b8ba4','#bce8f2'],prismGolem:['#6b7da8','#e4b2ec'],frostShade:['#6e89aa','#b4e2ee'],iceKnight:['#6e91a7','#d2f3f7'],crystalCrawler:['#4d8194','#8bd5e7'],starHarpy:['#617aa2','#a8c8f2'],tempestRoc:['#50658e','#9cbbe6'],emberGuard:['#9d453a','#e97a55'],ashMage:['#81577e','#d58bba'],malachar:['#7e2e2a','#ff8058'],crownDevourer:['#722f62','#f05783'],arenaChampion:['#6e7182','#c9cedd']};
    const palette=palettes[enemy.type]||['#69c759','#a1ed79']; ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(px+3,py+22,25,5);ctx.fillStyle=pulse?palette[1]:palette[0];
    if(['thornWolf','sewerRat','duneScarab','mireToad','crystalCrawler','mireHydra','sunWyrm'].includes(enemy.type)){ctx.fillRect(px+2,py+8,25,15);ctx.fillRect(px+18,py+3,12,13);ctx.fillRect(px,py+19,8,5);} else if(['iceKnight','emberGuard','malachar','oreGolem','forgeGuardian','glassSentinel','prismGolem','arenaChampion'].includes(enemy.type)){ctx.fillRect(px+6,py+4,20,23);ctx.fillRect(px+3,py+12,26,15);ctx.fillStyle='#d9dfe7';ctx.fillRect(px+8,py,16,8);} else if(['caveBat','starHarpy','tempestRoc'].includes(enemy.type)){ctx.fillRect(px+3,py+9,27,12);ctx.fillRect(px+10,py+3,14,17);ctx.fillRect(px-3,py+7,10,5);ctx.fillRect(px+27,py+7,10,5);} else {ctx.fillRect(px+4,py+4,20,19);ctx.fillRect(px,py+11,29,13);}
    ctx.fillStyle='#15211b';ctx.fillRect(px+8,py+13,4,4);ctx.fillRect(px+19,py+13,4,4); if(type.boss){ctx.fillStyle='#f6c453';ctx.fillRect(px+2,py-3,28,3);ctx.fillRect(px-2,py+1,3,27);ctx.fillRect(px+31,py+1,3,27);}
  }

  function drawChest(chest) { const px=chest.x*TILE+7,py=chest.y*TILE+10;ctx.fillStyle=chest.opened?'#5d4323':'#8b5b22';ctx.fillRect(px,py+8,26,16);ctx.fillStyle='#d69b33';ctx.fillRect(px,py+(chest.opened?2:3),26,9);ctx.fillStyle='#f3cd55';ctx.fillRect(px+11,py+10,5,8);if(chest.opened){ctx.fillStyle='#17131a';ctx.fillRect(px+3,py,20,5);} }
  function drawShrine(shrine) { if(!shrine)return;const px=shrine.x*TILE,py=shrine.y*TILE;ctx.fillStyle='#687285';ctx.fillRect(px+12,py+12,16,22);ctx.fillStyle='#95a3b9';ctx.fillRect(px+8,py+31,24,6);ctx.fillStyle='#4fd7ff';ctx.fillRect(px+17,py+6,6,12);ctx.fillStyle=`rgba(79,215,255,${.25+Math.sin(Date.now()/300)*.1})`;ctx.fillRect(px+11,py,18,24); }
  function drawExit(exit) { const px=exit.x*TILE,py=exit.y*TILE,unlocked=state.questStage>=(exit.minStage||0);ctx.fillStyle=unlocked?`rgba(81,185,255,${.32+Math.sin(Date.now()/250)*.1})`:'rgba(255,93,108,.28)';ctx.fillRect(px+5,py+5,30,30);ctx.strokeStyle=unlocked?'#74d9ff':'#ff5d6c';ctx.lineWidth=3;ctx.strokeRect(px+8,py+8,24,24);ctx.fillStyle=unlocked?'#eaf2ff':'#ff9aa5';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText(exit.y===0?'▲':exit.y===11?'▼':exit.x===0?'◀':'▶',px+20,py+25); }

  function drawNode(node) {
    if(!isNodeVisible(node))return; const px=node.x*TILE,py=node.y*TILE,pulse=.7+Math.sin(Date.now()/260)*.18;
    if(node.type==='herb'){ctx.fillStyle='#3a8f55';ctx.fillRect(px+15,py+18,4,14);ctx.fillRect(px+20,py+13,4,19);ctx.fillStyle='#77dd79';ctx.fillRect(px+10,py+14,9,6);ctx.fillRect(px+21,py+10,9,6);}
    else if(node.type==='ore'){ctx.fillStyle='#536477';ctx.fillRect(px+8,py+18,25,16);ctx.fillStyle='#84d7f4';ctx.fillRect(px+13,py+10,7,14);ctx.fillRect(px+23,py+13,6,12);}
    else if(node.type==='crystalMat'){ctx.fillStyle='#58b9d1';ctx.fillRect(px+12,py+13,8,20);ctx.fillRect(px+22,py+7,7,26);ctx.fillStyle='#c9f8ff';ctx.fillRect(px+23,py+9,2,15);}
    else if(node.type==='shell'){ctx.fillStyle='#d59d57';ctx.fillRect(px+10,py+17,22,15);ctx.fillStyle='#f3d28b';ctx.fillRect(px+14,py+13,14,7);ctx.fillStyle='#8d633c';ctx.fillRect(px+20,py+19,4,10);}
    else if(node.type==='rescue'){ctx.fillStyle='#8e6a49';ctx.fillRect(px+9,py+20,23,14);ctx.fillStyle='#d9a072';ctx.fillRect(px+15,py+8,12,13);ctx.fillStyle='#f4c95d';ctx.fillRect(px+7,py+15,28,4);}
    else if(node.type==='lore'){ctx.fillStyle='#58657c';ctx.fillRect(px+10,py+8,20,27);ctx.fillStyle='#b8c3d8';ctx.fillRect(px+14,py+12,12,3);ctx.fillRect(px+14,py+19,12,3);ctx.fillRect(px+14,py+26,8,3);}
    else {ctx.save();ctx.globalAlpha=pulse;ctx.fillStyle=['totem','coreSigil'].includes(node.type)?'#ff6e4c':'#66d7f0';ctx.fillRect(px+12,py+8,16,26);ctx.fillStyle='#f8e27b';ctx.fillRect(px+17,py+3,6,12);ctx.restore();}
  }

  function drawDecor(item) {
    const px=item.x*TILE,py=item.y*TILE;
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(px+x,py+y,w,h);};
    switch(item.type){
      case'flowers':rect(8,25,5,5,'#f3d35c');rect(20,20,5,5,'#df6d8e');rect(29,27,4,4,'#9b8cef');break;
      case'well':rect(7,18,26,15,'#6c7886');rect(10,14,20,6,'#a9b4bd');rect(14,20,12,8,'#214c67');break;
      case'dock':rect(0,15,40,18,'#704b2c');rect(0,18,40,4,'#b4844c');break;
      case'lamp':rect(18,8,4,28,'#3c414a');rect(13,6,14,11,'#f3d06b');break;
      case'bench':rect(8,23,25,5,'#815a37');rect(11,28,4,7,'#4e3424');rect(27,28,4,7,'#4e3424');break;
      case'sign':rect(18,15,4,21,'#5e3c25');rect(7,8,26,12,'#a87943');break;
      case'bridge':rect(0,10,40,20,'#755135');rect(0,14,40,4,'#b88b55');break;
      case'mushrooms':rect(9,25,4,8,'#e8d9b4');rect(6,21,10,5,'#b75f73');rect(24,24,4,9,'#e8d9b4');rect(20,19,12,6,'#8066b3');break;
      case'fountain':rect(7,25,26,9,'#7d8994');rect(12,20,16,7,'#4db7d5');rect(18,7,4,17,'#a7ecf4');break;
      case'cart':rect(6,15,28,14,'#805532');rect(8,29,7,7,'#2e2926');rect(26,29,7,7,'#2e2926');break;
      case'statue':rect(14,8,12,23,'#8992a0');rect(10,30,20,6,'#626d7c');rect(17,3,6,8,'#c3ccd3');break;
      case'pipe':rect(4,16,32,8,'#59666a');rect(8,11,9,18,'#78878b');break;
      case'barrel':rect(10,10,20,26,'#7c5030');rect(8,15,24,4,'#3f352e');rect(8,28,24,4,'#3f352e');break;
      case'grate':rect(7,9,26,26,'#222b31');for(let i=0;i<4;i++)rect(10+i*6,10,3,24,'#667278');break;
      case'bell':rect(10,8,20,21,'#d0a84d');rect(18,28,4,7,'#5b3c28');break;
      case'wheat':for(let i=0;i<5;i++){rect(8+i*5,15+(i%2)*3,3,20,'#d5b257');rect(5+i*5,13+(i%2)*3,7,4,'#edcf79');}break;
      case'brazier':rect(11,25,18,8,'#5a4a43');rect(15,14,10,14,'#f16a3d');rect(18,9,5,12,'#ffd35d');break;
      case'anvil':rect(8,18,25,8,'#626a75');rect(13,26,15,9,'#3c434c');rect(5,14,30,5,'#8b959f');break;
      case'rail':rect(0,12,40,4,'#6c6258');rect(0,27,40,4,'#6c6258');for(let i=0;i<4;i++)rect(i*12,10,4,24,'#8d6d49');break;
      case'crystal':rect(10,15,7,20,'#54b8d2');rect(20,8,8,27,'#79e0ef');rect(22,10,2,17,'#d9fbff');break;
      case'palm':rect(18,18,6,20,'#8a5a31');rect(4,10,32,7,'#4b9a55');rect(12,4,16,12,'#68b95e');break;
      case'banner':rect(18,5,4,31,'#59616e');rect(22,8,13,20,'#b43e4c');rect(25,11,7,4,'#f2c85a');break;
      case'ruin':rect(7,10,8,26,'#8c806c');rect(25,15,8,21,'#8c806c');rect(5,8,28,6,'#b5a789');break;
      case'bones':rect(9,23,23,4,'#e8e0ca');rect(13,17,4,16,'#e8e0ca');rect(25,17,4,16,'#e8e0ca');break;
      case'obelisk':rect(14,7,12,28,'#4b5265');rect(17,2,6,8,'#85d7ee');break;
      case'tent':ctx.fillStyle='#b55d4f';ctx.beginPath();ctx.moveTo(px+4,py+33);ctx.lineTo(px+20,py+7);ctx.lineTo(px+36,py+33);ctx.fill();rect(18,20,4,13,'#322225');break;
      case'mirrorDecor':rect(12,6,16,28,'#6c7d92');rect(15,9,10,22,'#c9f3fb');break;
      case'hotSpring':rect(3,20,34,15,'#7daeb7');rect(6,23,28,9,'#a8e5ea');break;
      case'snowman':rect(13,20,15,15,'#f3fbff');rect(16,10,10,11,'#f3fbff');rect(21,14,6,3,'#e28b3d');break;
      case'telescope':rect(8,10,25,7,'#586c8a');rect(22,16,5,20,'#3d4658');rect(10,8,7,11,'#8fc5e7');break;
      case'cloud':rect(3,18,34,10,'#e7f5ff');rect(10,12,12,14,'#f6fbff');rect(22,14,10,12,'#f6fbff');break;
      case'throne':rect(11,9,18,27,'#5d3537');rect(7,6,26,8,'#a65447');rect(15,3,10,7,'#e2b84f');break;
      case'crown':rect(8,18,24,10,'#f0bd42');rect(10,9,5,12,'#f0bd42');rect(18,5,5,16,'#f0bd42');rect(26,9,5,12,'#f0bd42');break;
      case'flame':rect(14,17,12,18,'#f06b32');rect(18,8,6,20,'#ffd65e');break;
    }
  }

  function drawAmbient(loc) {
    const t = Date.now() / 1000;
    ctx.save();
    for (let i=0;i<18;i++) {
      const x=(i*97 + t*(6+(i%3)*3))%canvas.width, y=(i*53 + Math.sin(t+i)*18 + 480)%canvas.height;
      const snowy=['snow','iceCave','sky'].includes(loc.biome), fiery=['citadel','core'].includes(loc.biome);
      ctx.globalAlpha=.16+(i%4)*.035; ctx.fillStyle=fiery?'#ff8b48':snowy?'#eefcff':'#d8f0a0';
      ctx.fillRect(Math.floor(x),Math.floor(y),fiery?3:2,fiery?3:2);
    }
    const glow=ctx.createRadialGradient(320,210,20,320,210,330); glow.addColorStop(0,'rgba(255,224,154,.055)'); glow.addColorStop(1,'rgba(5,9,18,.16)'); ctx.fillStyle=glow;ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.restore();
  }

  function drawWorld() {
    ctx.clearRect(0,0,canvas.width,canvas.height); const loc=currentLocation();
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)drawTile(x,y,loc.map[y][x]);
    loc.decor.forEach(drawDecor); loc.exits.forEach(drawExit); drawShrine(loc.shrine); loc.nodes.forEach(drawNode); loc.chests.forEach(drawChest); loc.enemies.forEach(drawEnemy);
    loc.npcs.forEach(npc=>drawCharacter(npc.x,npc.y,npc.colors,'down',npc.role==='cael'));
    drawCharacter(state.player.x,state.player.y,currentJob().colors,state.player.facing);
    drawAmbient(loc);
    const cycle=(currentPlaySeconds()%480)/480; if(cycle>.55){ctx.fillStyle=`rgba(20,28,65,${Math.min(.22,(cycle-.55)*.5)})`;ctx.fillRect(0,0,canvas.width,canvas.height);} drawLocationLabel();
  }

  function drawLocationLabel(){ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillStyle='rgba(6,10,18,.76)';ctx.fillRect(215,448,210,22);ctx.fillStyle='#f6c453';ctx.fillText(currentLocation().short,320,463);}
  function animate(){if(state.started&&!state.inBattle&&!menusOpen()&&ui.ending.classList.contains('hidden'))drawWorld();const sec=currentPlaySeconds();if(sec!==lastClockSecond){lastClockSecond=sec;ui.playTime.textContent=formatTime(sec);}requestAnimationFrame(animate);}

  function queueDialogue(speaker, lines) {
    state.dialogueQueue = lines.map(line => typeof line === 'string' ? { speaker, text: line } : line);
    ui.dialogue.classList.remove('hidden'); nextDialogue();
  }
  function nextDialogue() {
    const line=state.dialogueQueue.shift(); if(!line){ui.dialogue.classList.add('hidden');return;}
    ui.speaker.textContent=String(line.speaker||'Narrator').toUpperCase();ui.dialogueText.textContent=line.text;beep(260,.045,'square',.02);
  }
  function setStage(next, logText) {
    if(next<=state.questStage)return;state.questStage=next;if(logText)addLog(logText,true);showToast(next===FINAL_STAGE?'THE STORY IS COMPLETE':`STORY ${Math.round(next/FINAL_STAGE*100)}%`);updateHud();saveGame(true);
  }

  function renderJobSelection() {
    ui.jobGrid.innerHTML = Object.entries(JOBS).map(([id,job]) => `<button class="job-card" data-job="${id}" type="button"><h3>${escapeHtml(job.name)}</h3><p>${escapeHtml(job.desc)}</p><small>HP ${job.hp} · MP ${job.mp} · ATK ${job.attack} · DEF ${job.defense}<br>${escapeHtml(job.skills[0].name)} / ${escapeHtml(job.skills[1].name)}</small></button>`).join('');
    ui.jobGrid.querySelectorAll('[data-job]').forEach(button=>button.addEventListener('click',()=>selectJob(button.dataset.job)));
  }

  function startNewGame() {
    resetWorld(); state=initialState(); state.started=true; sessionStartedAt=Date.now(); ui.title.classList.add('hidden'); ui.jobScreen.classList.remove('hidden'); ui.ending.classList.add('hidden'); renderJobSelection(); updateHud();
  }

  function selectJob(jobId) {
    const job=JOBS[jobId]; if(!job)return; const p=state.player; p.job=jobId;p.maxHp=job.hp;p.hp=job.hp;p.maxMp=job.mp;p.mp=job.mp;p.baseAttack=job.attack;p.defense=job.defense;p.equippedWeapon=job.starter;p.weapons=[job.starter];
    ui.jobScreen.classList.add('hidden'); addLog(`Rowan takes the path of the ${job.name}.`,true);addLog('Find Elder Mira near Moonmere’s central well.');updateHud();drawWorld();chord([330,440,660]);
    queueDialogue('Narrator',[`You choose the path of the ${job.name}.`, 'For three hundred years, the broken Ember Crown slept beneath the Ashen Citadel.', 'Tonight a red star rises over Moonmere—and every one of the Seven Roads begins to burn.']);
    saveGame(true);
  }

  function renderGear() {
    if(!state.started||!state.player.job)return;
    const job=currentJob();
    ui.weaponGrid.innerHTML=state.player.weapons.map(id=>{const w=WEAPONS[id];const equipped=id===state.player.equippedWeapon;return `<div class="weapon-card ${equipped?'equipped':''}"><h4>${escapeHtml(w.name)} ${equipped?'· EQUIPPED':''}</h4><p>${escapeHtml(w.type.toUpperCase())} · +${w.power} power<br>${escapeHtml(w.desc)}</p><button class="pixel-button compact" data-equip="${id}" type="button" ${equipped?'disabled':''}>${equipped?'EQUIPPED':'EQUIP'}</button></div>`;}).join('');
    ui.weaponGrid.querySelectorAll('[data-equip]').forEach(button=>button.addEventListener('click',()=>equipWeapon(button.dataset.equip)));
    ui.jobDetails.innerHTML=`<strong>${escapeHtml(job.name)}</strong><br>${escapeHtml(job.desc)}<br><br><strong>${escapeHtml(job.skills[0].name)} (${job.skills[0].cost} MP)</strong><br>${escapeHtml(job.skills[0].desc)}<br><br><strong>${escapeHtml(job.skills[1].name)} (${job.skills[1].cost} MP)</strong><br>${escapeHtml(job.skills[1].desc)}<br><br>Bombs: <strong>${state.player.bombs}</strong> · Arena wins: <strong>${state.counters.arenaWins}</strong>`;
    ui.sideQuestList.innerHTML=Object.entries(SIDE_QUESTS).map(([id,q])=>{const sq=state.sideQuests[id]||{status:'available'};const progress=Math.min(q.goal,cValue(q.counter));return `<div><strong>${escapeHtml(q.name)}</strong><br>${escapeHtml(q.desc)}<br>${progress}/${q.goal} · ${escapeHtml(sq.status.toUpperCase())}</div>`;}).join('');
    ui.loreText.textContent=`${state.counters.lore} / ${TOTAL_LORE}`;
  }

  function equipWeapon(id) {
    const weapon=WEAPONS[id],job=currentJob();if(!weapon||!state.player.weapons.includes(id))return;if(!job.weapons.includes(weapon.type)){showToast('YOUR JOB CANNOT USE THAT');return;}state.player.equippedWeapon=id;addLog(`${weapon.name} equipped.`,true);beep(620);updateHud();saveGame(true);
  }
  function openGear() { if(!state.started||state.inBattle||!ui.dialogue.classList.contains('hidden')||!ui.ending.classList.contains('hidden'))return;renderGear();ui.gear.classList.remove('hidden'); }
  function closeGear(){ui.gear.classList.add('hidden');drawWorld();}

  function openWeaponShop(catalogId, shopName='Weapon Shop') {
    state.activeShop={type:'weapon',catalogId};ui.shopTitle.textContent=shopName.toUpperCase();ui.shopCopy.textContent='Weapons are permanently added to your collection. Only compatible weapons are shown.';renderShop();ui.shop.classList.remove('hidden');
  }
  function openConsumableShop(shopName='Travel Supplies') {
    state.activeShop={type:'consumable'};ui.shopTitle.textContent=shopName.toUpperCase();ui.shopCopy.textContent='Stock up before a long road. Bombs ignore enemy defenses.';renderShop();ui.shop.classList.remove('hidden');
  }
  function renderShop() {
    if(!state.activeShop)return;const p=state.player;
    if(state.activeShop.type==='weapon'){
      const ids=(SHOP_CATALOGS[state.activeShop.catalogId]||[]).filter(id=>{const w=WEAPONS[id];return currentJob().weapons.includes(w.type)&&state.questStage>=(w.minStage||0);});
      ui.shopItems.innerHTML=ids.length?ids.map(id=>{const w=WEAPONS[id],owned=p.weapons.includes(id);return `<div class="shop-item"><div><h4>${escapeHtml(w.name)} · +${w.power} POWER</h4><p>${escapeHtml(w.desc)}<br>${escapeHtml(w.type.toUpperCase())}</p></div><button class="pixel-button compact" data-buy-weapon="${id}" type="button" ${owned?'disabled':''}>${owned?'OWNED':`${w.price} GOLD`}</button></div>`;}).join(''):'<div class="record-card">No compatible new weapons are available yet.</div>';
      ui.shopItems.querySelectorAll('[data-buy-weapon]').forEach(button=>button.addEventListener('click',()=>buyWeapon(button.dataset.buyWeapon)));
    } else {
      const items=[{id:'potion',name:'Healing Potion',price:28,desc:'Restores HP during battle.'},{id:'bomb',name:'Crown Bomb',price:45,desc:'Deals heavy defense-piercing damage.'},{id:'rest',name:'Full Rest',price:18,desc:'Restores all HP and MP immediately.'}];
      ui.shopItems.innerHTML=items.map(item=>`<div class="shop-item"><div><h4>${item.name}</h4><p>${item.desc}</p></div><button class="pixel-button compact" data-buy-item="${item.id}" type="button">${item.price} GOLD</button></div>`).join('');
      ui.shopItems.querySelectorAll('[data-buy-item]').forEach(button=>button.addEventListener('click',()=>buyConsumable(button.dataset.buyItem)));
    }
  }
  function buyWeapon(id){const w=WEAPONS[id],p=state.player;if(!w||p.weapons.includes(id))return;if(p.gold<w.price){showToast('NOT ENOUGH GOLD');beep(90);return;}p.gold-=w.price;p.weapons.push(id);p.equippedWeapon=id;addLog(`${w.name} purchased and equipped.`,true);chord([220,330,440]);renderShop();updateHud();saveGame(true);}
  function buyConsumable(id){const prices={potion:28,bomb:45,rest:18},price=prices[id],p=state.player;if(p.gold<price){showToast('NOT ENOUGH GOLD');return;}p.gold-=price;if(id==='potion')p.potions+=1;if(id==='bomb')p.bombs+=1;if(id==='rest'){p.hp=p.maxHp;p.mp=p.maxMp;}showToast(id==='rest'?'FULLY RESTORED':'PURCHASE COMPLETE');beep(660);renderShop();updateHud();saveGame(true);}
  function closeShop(){ui.shop.classList.add('hidden');state.activeShop=null;drawWorld();}

  function worldSnapshot(){const result={};Object.entries(locations).forEach(([id,loc])=>{result[id]={enemies:Object.fromEntries(loc.enemies.map(e=>[e.id,!!e.defeated])),chests:Object.fromEntries(loc.chests.map(c=>[c.id,!!c.opened])),nodes:Object.fromEntries(loc.nodes.map(n=>[n.id,!!n.collected]))};});return result;}
  function restoreWorld(snapshot={}){Object.entries(locations).forEach(([id,loc])=>{loc.enemies.forEach(e=>{e.defeated=!!snapshot[id]?.enemies?.[e.id];});loc.chests.forEach(c=>{c.opened=!!snapshot[id]?.chests?.[c.id];});loc.nodes.forEach(n=>{n.collected=!!snapshot[id]?.nodes?.[n.id];});});}
  function saveGame(silent=false){if(!state.started||!state.player.job)return;const elapsed=currentPlaySeconds();const saveState={...state,playSeconds:elapsed,dialogueQueue:[],inBattle:false,battleEnemy:null,battleLocked:false,activeEnemyId:null,activeShop:null,timingActive:false,timingStartedAt:0,timingFrame:0,battleCombo:0,battleMaxCombo:0,battleMomentum:0,battleLastAction:'',battlePerfects:0,battleDamageTaken:0,battleTurns:0};localStorage.setItem(SAVE_KEY,JSON.stringify({version:3,state:saveState,world:worldSnapshot()}));updateHud();if(!silent){showToast('ADVENTURE SAVED');beep(660);}}
  function loadGame(){const raw=localStorage.getItem(SAVE_KEY);if(!raw)return;try{const save=JSON.parse(raw);if(save.version!==3)throw new Error('old save');resetWorld();restoreWorld(save.world);const fresh=initialState();state={...fresh,...save.state,player:{...fresh.player,...(save.state?.player||{})},counters:{...fresh.counters,...(save.state?.counters||{})},keyItems:{...fresh.keyItems,...(save.state?.keyItems||{})},sideQuests:{...initialSideQuests(),...(save.state?.sideQuests||{})},started:true,inBattle:false,battleEnemy:null,battleLocked:false,dialogueQueue:[],activeEnemyId:null,activeShop:null};if(!locations[state.location])state.location='moonmere';if(!JOBS[state.player.job])throw new Error('invalid job');sessionStartedAt=Date.now();ui.title.classList.add('hidden');ui.jobScreen.classList.add('hidden');ui.dialogue.classList.add('hidden');ui.battle.classList.add('hidden');ui.gear.classList.add('hidden');ui.shop.classList.add('hidden');ui.ending.classList.add('hidden');addLog('Your long road continues.',true);updateHud();drawWorld();chord([440,554,660]);}catch(_){localStorage.removeItem(SAVE_KEY);showToast('SAVE FORMAT WAS OUTDATED');}}
  function resetGame(){if(!confirm('Erase your local Emberfall save and restart the campaign?'))return;localStorage.removeItem(SAVE_KEY);resetWorld();state=initialState();sessionStartedAt=Date.now();ui.title.classList.remove('hidden');ui.jobScreen.classList.add('hidden');ui.dialogue.classList.add('hidden');ui.battle.classList.add('hidden');ui.gear.classList.add('hidden');ui.shop.classList.add('hidden');ui.ending.classList.add('hidden');renderLog();updateHud();}

  function move(dx,dy){
    if(!state.started||!state.player.job||state.inBattle||menusOpen()||!ui.dialogue.classList.contains('hidden')||!ui.ending.classList.contains('hidden'))return;
    const now=Date.now();if(now-lastMove<80)return;lastMove=now;const nx=state.player.x+dx,ny=state.player.y+dy;state.player.facing=dx<0?'left':dx>0?'right':dy<0?'up':'down';if(isBlocked(nx,ny)){beep(100,.04,'square',.02);return;}state.player.x=nx;state.player.y=ny;beep(150+((nx+ny)%2)*25,.025,'square',.015);checkTile();
  }
  function checkTile(){
    const loc=currentLocation();const enemy=loc.enemies.find(e=>isEnemyVisible(e)&&e.x===state.player.x&&e.y===state.player.y);if(enemy){startBattle(enemy);return;}
    if(loc.shrine&&state.player.x===loc.shrine.x&&state.player.y===loc.shrine.y){state.player.hp=state.player.maxHp;state.player.mp=state.player.maxMp;showToast('THE SHRINE RESTORES YOU');addLog(`The shrine of ${loc.name} restores your strength.`);chord([392,523,659]);updateHud();}
    const exit=loc.exits.find(e=>e.x===state.player.x&&e.y===state.player.y);if(exit){if(state.questStage<(exit.minStage||0)){showToast('THE WAY IS SEALED');queueDialogue('Locked Passage',[exit.locked||'The road is not yet open.']);stepAwayFromEdge(exit);}else travel(exit.target,exit.targetPos,exit.label);}
  }
  function stepAwayFromEdge(exit){if(exit.x===0)state.player.x=1;else if(exit.x===COLS-1)state.player.x=COLS-2;else if(exit.y===0)state.player.y=1;else if(exit.y===ROWS-1)state.player.y=ROWS-2;}
  function travel(target,targetPos){if(!locations[target])return;state.location=target;state.player.x=targetPos.x;state.player.y=targetPos.y;state.player.facing='down';const loc=currentLocation();showToast(loc.short);addLog(`Arrived at ${loc.name}.`,true);chord([330,440,554]);updateHud();saveGame(true);drawWorld();}

  function interact(){
    if(!state.started)return;if(!ui.dialogue.classList.contains('hidden')){nextDialogue();return;}if(state.inBattle||menusOpen()||!ui.ending.classList.contains('hidden'))return;
    const loc=currentLocation();const targets=[...loc.npcs.map(n=>({...n,kind:'npc'})),...loc.chests.map(c=>({...c,kind:'chest'})),...loc.nodes.filter(isNodeVisible).map(n=>({...n,kind:'node'}))];
    const near=targets.find(t=>Math.abs(t.x-state.player.x)+Math.abs(t.y-state.player.y)<=1);if(!near){showToast('NOTHING TO INTERACT WITH');beep(110);return;}if(near.kind==='npc')talkToNpc(near);else if(near.kind==='chest')openChest(near.id);else collectNode(near.id);
  }

  function storyNodeReady(type){const required={totem:11,rescue:15,sunSeal:19,mirror:23,starKey:31,coreSigil:37};return state.questStage===(required[type]??state.questStage);}
  function collectNode(nodeId){
    const node=currentLocation().nodes.find(n=>n.id===nodeId);if(!node||node.collected)return;
    if(['totem','rescue','sunSeal','mirror','starKey','coreSigil'].includes(node.type)&&!storyNodeReady(node.type)){queueDialogue('Ancient Mechanism',['The object does not answer you yet. Continue the main story.']);return;}
    node.collected=true;let text='';
    if(node.type==='herb'){state.counters.herbs+=1;text='Moon Herb gathered.';}
    if(node.type==='ore'){state.counters.ore+=1;text='Star Ore gathered.';}
    if(node.type==='crystalMat'){state.counters.crystals+=1;text='Frost Crystal gathered.';}
    if(node.type==='shell'){state.counters.shells+=1;text='Sun Shell collected.';}
    if(node.type==='lore'){state.counters.lore+=1;text=node.text||'An ancient tablet reveals another fragment of history.';}
    if(node.type==='totem'){state.keyItems.mireTotems+=1;text=`Witchfire totem cleansed (${state.keyItems.mireTotems}/4).`;}
    if(node.type==='rescue'){state.keyItems.miners+=1;text=`A trapped miner is led to safety (${state.keyItems.miners}/3).`;}
    if(node.type==='sunSeal'){state.keyItems.sunSeals+=1;text=`Sun Seal recovered (${state.keyItems.sunSeals}/4).`;}
    if(node.type==='mirror'){state.keyItems.mirrorShards+=1;text=`Mirror pylon aligned (${state.keyItems.mirrorShards}/4).`;}
    if(node.type==='starKey'){state.keyItems.starKeys+=1;text=`Star Key recovered (${state.keyItems.starKeys}/4).`;}
    if(node.type==='coreSigil'){state.keyItems.coreSigils+=1;text=`Crown command awakened (${state.keyItems.coreSigils}/3).`;}
    addLog(text,true);queueDialogue(node.type==='lore'?'Ancient Tablet':'Discovery',[text]);chord([659,784,988]);evaluateProgress();updateHud();saveGame(true);
  }

  function talkToNpc(npc){
    const handlers={mira:talkMira,talia:talkTalia,elowen:talkElowen,orin:talkOrin,ivo:talkIvo,maela:talkMaela,lyra:talkLyra,suri:talkSuri,freya:talkFreya,vey:talkVey,cael:talkCael,innkeeper:talkInnkeeper,arena:talkArena};
    if(npc.role==='weaponShop'){openWeaponShop(npc.shop,npc.name);return;}if(npc.role==='consumableShop'){openConsumableShop(npc.name);return;}if(npc.role==='sideQuest'){talkSideQuest(npc.quest,npc.name);return;}(handlers[npc.role]||(()=>queueDialogue(npc.name,['The Seven Roads are dangerous. Keep your gear ready.'])))(npc);updateHud();
  }

  function talkMira(){
    if(state.questStage===0){setStage(1,'Quest accepted: The Red Star.');queueDialogue('Elder Mira',['Ash has fallen on Moonmere though no fire burns for a hundred miles.','The Moss Slimes carry a black crown-mark. Defeat four and bring me proof.','Your chosen path will be tested before the night is over.']);}
    else if(state.questStage===1)queueDialogue('Elder Mira',[`The mark still stains the fields. You have defeated ${Math.min(state.counters.moss,4)} of 4 slimes.`]);
    else if(state.questStage===2){grantReward({gold:70,potions:2,exp:55},'Moonmere’s reward');setStage(3,'The east road to Whisperwood is open.');queueDialogue('Elder Mira',['The mark belongs to Malachar, last keeper of the Ember Crown.','Take the Wayfarer Crest. Ranger Elowen watches the first of the Seven Roads.','Every village ahead holds a piece of the truth—and a reason Malachar must not command the crown again.']);}
    else queueDialogue('Elder Mira',state.questStage<34?['Each road you save strengthens all the others. Moonmere keeps a lamp for your return.']:['The red star is breaking apart. Finish the road, Rowan.']);
  }
  function talkTalia(){if(state.questStage<3)queueDialogue('Captain Talia',['The east road remains closed until Mira declares the fields safe.']);else queueDialogue('Captain Talia',['Whisperwood begins beyond the blue gate. The road now knows your crest.']);}
  function talkElowen(){
    if(state.questStage===3){setStage(4,'Quest accepted: Whispers in Thorns.');queueDialogue('Ranger Elowen',['The wolves are not hunting for meat. Thorn-vines are growing from their wounds.','Drive back five packs. I need enough silence to hear what the forest remembers.','Gather herbs for Sena while you travel; the wounded keep arriving.']);}
    else if(state.questStage===4)queueDialogue('Ranger Elowen',[`The forest still howls. ${Math.min(state.counters.wolves,5)} of 5 packs have fallen.`]);
    else if(state.questStage===5){grantReward({gold:95,potions:2,exp:75},'Whisperwood’s reward');setStage(6,'The road to Greymoor City is open.');queueDialogue('Ranger Elowen',['The roots whispered one name: Greymoor. Something below the city is drinking memories from the soil.','Take this black feather to Mayor Orin. It came from no bird born beneath our sky.','The second road waits beyond the eastern thorns.']);}
    else queueDialogue('Ranger Elowen',['The forest speaks your name as a promise now, not a warning.']);
  }
  function talkOrin(){
    if(state.questStage===6){setStage(7,'Quest accepted: The Dusk Below.');queueDialogue('Mayor Orin',['Our wells turned violet the same night your red star appeared.','Four Dusk Crystals regulate the pumps. Sewer creatures have swallowed their light.','Recover them, then destroy the Tyrant at the deepest floodgate.']);}
    else if(state.questStage===7)queueDialogue('Mayor Orin',[`The city pumps are failing. You have recovered ${Math.min(state.keyItems.duskCrystals,4)} of 4 Dusk Crystals.`]);
    else if(state.questStage===8)queueDialogue('Mayor Orin',['The crystals turn again, but the Sewer Tyrant guards the release gate. End it.']);
    else if(state.questStage===9){grantReward({gold:140,potions:3,bombs:2,exp:105},'Greymoor’s reward');setStage(10,'The bridge to Dawnwatch is open.');queueDialogue('Mayor Orin',['Greymoor can remember itself again. The Tyrant’s nest held a monastery bell marked with Malachar’s seal.','Brother Ivo in Dawnwatch guards the third road. The marsh beyond his village has begun ringing without wind.','Cross the eastern bridge before the bells call something worse.']);}
    else queueDialogue('Mayor Orin',['The canals run clear. Greymoor now writes your name into every city ledger—twice, for accuracy.']);
  }
  function talkIvo(){
    if(state.questStage===10){setStage(11,'Quest accepted: Bells in the Marsh.');queueDialogue('Brother Ivo',['Stormfen once carried the kingdom’s funeral bells. Now witchfire totems make them ring beneath the water.','Cleanse four totems. When their flames die, the Mire Hydra will lose its shelter.','Do not mistake the marsh for empty land. It is crowded with old grief.']);}
    else if(state.questStage===11)queueDialogue('Brother Ivo',[`The drowned bells still sound. ${Math.min(state.keyItems.mireTotems,4)} of 4 totems are cleansed.`]);
    else if(state.questStage===12)queueDialogue('Brother Ivo',['The totems are dark. The Mire Hydra waits at the southern shrine.']);
    else if(state.questStage===13){grantReward({gold:175,potions:3,bombs:2,exp:130},'Dawnwatch’s reward');setStage(14,'The mountain road to Ironridge is open.');queueDialogue('Brother Ivo',['The final bell rang once when the Hydra fell. It named Ironridge.','The royal forge made the empty frame of the Ember Crown. If Malachar seeks to rebuild it, he will need that forge.','Queen Maela must be warned before the mountain opens for him.']);}
    else queueDialogue('Brother Ivo',['The bells ring only for sunrise now. That is the sound they were made to carry.']);
  }
  function talkMaela(){
    if(state.questStage===14){setStage(15,'Quest accepted: The Mountain Forge.');queueDialogue('Queen Maela',['The mine lift failed with three crews below. Our Forge Guardian now attacks anyone carrying royal blood.','Rescue three trapped miners. Their route markers will guide you to the forge chamber.','Then defeat the Guardian before Malachar claims the star ore.']);}
    else if(state.questStage===15)queueDialogue('Queen Maela',[`Three families wait at the lift. You have rescued ${Math.min(state.keyItems.miners,3)} of 3 miners.`]);
    else if(state.questStage===16)queueDialogue('Queen Maela',['The miners are safe. The Forge Guardian waits below the last rail.']);
    else if(state.questStage===17){grantReward({gold:220,potions:4,bombs:3,exp:160},'Ironridge’s reward');setStage(18,'The rail to Sunspire City is restored.');queueDialogue('Queen Maela',['The Guardian recognized your crest before it fell. Inside its core was a map of the Sunspire archives.','Archivist Lyra has studied the crown longer than anyone living. Take her this shard of star ore.','The fourth road runs east through fire and gold.']);}
    else queueDialogue('Queen Maela',['The royal forge burns for tools, plows, and bridges again. It will not build another crown.']);
  }
  function talkLyra(){
    if(state.questStage===18){setStage(19,'Quest accepted: The Sun Command.');queueDialogue('Archivist Lyra',['The crown was broken into commands: Dusk remembers, Sun reveals, Frost restrains, and Star chooses.','Four Sun Seals open the buried temple. Recover them and defeat the Sun-Eater Wyrm.','The truth inside the Sun Command may be more dangerous than the beast guarding it.']);}
    else if(state.questStage===19)queueDialogue('Archivist Lyra',[`The archive key needs all four seals. You have ${Math.min(state.keyItems.sunSeals,4)} of 4.`]);
    else if(state.questStage===20)queueDialogue('Archivist Lyra',['The temple is open. The Sun-Eater Wyrm waits at its southern altar.']);
    else if(state.questStage===21){state.keyItems.crownCommands=1;grantReward({gold:270,potions:4,bombs:3,exp:195},'Sunspire’s reward');setStage(22,'The caravan to Mirage Oasis is ready.');queueDialogue('Archivist Lyra',['The Sun Command revealed Malachar’s secret: he is afraid of a future he cannot control.','Oracle Suri at Mirage Oasis guards the path to the command of Choice—hidden in a temple of possible worlds.','Take the eastern caravan. Every road after this one leads closer to the Crown.']);}
    else queueDialogue('Archivist Lyra',['The archives have promoted you from “probable legend” to “historically inconvenient certainty.”']);
  }
  function talkSuri(){
    if(state.questStage===22){setStage(23,'Quest accepted: Mirrors of Choice.');queueDialogue('Oracle Suri',['The Glass Temple shows every life you might have lived. Do not follow any reflection that calls you by another name.','Align four mirror pylons. Their light will awaken the Prism Golem.','Defeat it, and the road north will stop pretending not to exist.']);}
    else if(state.questStage===23)queueDialogue('Oracle Suri',[`The temple still divides the future. ${Math.min(state.keyItems.mirrorShards,4)} of 4 pylons are aligned.`]);
    else if(state.questStage===24)queueDialogue('Oracle Suri',['The mirrors agree at last. The Prism Golem waits at the temple heart.']);
    else if(state.questStage===25){state.keyItems.crownCommands=2;grantReward({gold:320,potions:5,bombs:4,exp:225},'Mirage Oasis reward');setStage(26,'The hidden road to Frosthollow is visible.');queueDialogue('Oracle Suri',['The temple showed me seven victories and one honest defeat. You chose the road where others remain free.','Frosthollow guards the command that can restrain the crown. Malachar has sent a dead knight to claim it.','Follow the northern mirage before it closes at moonrise.']);}
    else queueDialogue('Oracle Suri',['I can no longer see your ending. For the first time, that brings me comfort.']);
  }
  function talkFreya(){
    if(state.questStage===26){setStage(27,'Quest accepted: Winter’s Name.');queueDialogue('Warden Freya',['The Icebound Knight was once our protector. Malachar woke him by erasing his name.','Five Frost Shades anchor the curse around the village. Break them first.','The Crystal Cavern is optional, but its singing stones can fund powerful northern weapons.']);}
    else if(state.questStage===27)queueDialogue('Warden Freya',[`The curse grips the roofs. You have defeated ${Math.min(state.counters.shades,5)} of 5 Frost Shades.`]);
    else if(state.questStage===28)queueDialogue('Warden Freya',['The shades are gone. The Icebound Knight waits at the northern gate. Speak his title when you strike.']);
    else if(state.questStage===29){state.keyItems.frostSigil=true;state.keyItems.crownCommands=3;grantReward({gold:380,potions:5,bombs:4,exp:260},'Frosthollow’s reward');setStage(30,'The aurora bridge to Starfall City is open.');queueDialogue('Warden Freya',['The knight remembered his name at the end: Edrin. He gave you the Frost Command willingly.','Only the Star Command remains. Astronomer Vey watches it from the city above the aurora.','The sixth road climbs where winter touches the stars.']);}
    else queueDialogue('Warden Freya',['Snow falls softly again. The village says Edrin’s name at every watch change.']);
  }
  function talkVey(){
    if(state.questStage===30){setStage(31,'Quest accepted: The Fourth Star.');queueDialogue('Astronomer Vey',['Prince Cael hid the Star Command in four keys among the floating ruins.','Recover them. Their alignment will awaken the Tempest Roc, guardian of the final skybridge.','The Star Command does not choose kings. It chooses whether anyone should command at all.']);}
    else if(state.questStage===31)queueDialogue('Astronomer Vey',[`The observatory waits for ${4-Math.min(state.keyItems.starKeys,4)} more key${state.keyItems.starKeys===3?'':'s'}.`]);
    else if(state.questStage===32)queueDialogue('Astronomer Vey',['The four keys are aligned. The Tempest Roc circles the northern platform.']);
    else if(state.questStage===33){state.keyItems.crownCommands=4;grantReward({gold:450,potions:6,bombs:5,exp:300},'Starfall’s reward');setStage(34,'The black road to the Ashen Citadel has appeared.');queueDialogue('Astronomer Vey',['The Star Command has chosen: the crown must be sealed by consent, not conquest.','The black road now leads to the Ashen Citadel. Prince Cael’s ghost has waited there for three centuries.','Walk the seventh road. Then decide what kind of victory the kingdom deserves.']);}
    else queueDialogue('Astronomer Vey',['The stars have stopped warning us. Now they are simply watching.']);
  }
  function talkCael(){
    if(state.questStage===34){setStage(35,'Quest accepted: The Ashen Throne.');queueDialogue('Prince Cael',['I was the last prince of Emberfall—and the first fool to believe Malachar could make certainty merciful.','Six crown servants bind the throne hall. Break them, then confront him.','When he falls, the Crown will open. Inside waits the hunger that taught us both to fear the future.']);}
    else if(state.questStage===35)queueDialogue('Prince Cael',[`The throne flame still has ${Math.max(0,6-state.counters.guards)} servant${state.counters.guards===5?'':'s'} remaining.`]);
    else if(state.questStage===36)queueDialogue('Prince Cael',['The servants are gone. Malachar stands alone beneath the throne. Remember: defeating him is only the door.']);
    else queueDialogue('Prince Cael',['For the first time in three centuries, these halls belong to no ruler. Keep them that way.']);
  }
  function talkInnkeeper(){const p=state.player;if(p.hp===p.maxHp&&p.mp===p.maxMp){queueDialogue('Innkeeper Hobb',['You look painfully healthy. Come back after a cavern or two.']);return;}if(p.gold<20){queueDialogue('Innkeeper Hobb',['A bed and hot soup cost 20 gold. The stove is free if you stand nearby and look tragic.']);return;}if(confirm('Rest at the Frost Lantern Inn for 20 gold?')){p.gold-=20;p.hp=p.maxHp;p.mp=p.maxMp;queueDialogue('Innkeeper Hobb',['Fresh blankets, hot soup, and no haunted armor before breakfast.']);chord([392,523,659]);}}
  function talkArena(){if(state.questStage<14){queueDialogue('Arena Master Kesh',['The arena opens only to heroes recognized by Queen Maela.']);return;}if(state.inBattle)return;if(confirm('Fight a scaling arena champion? You keep the gold and EXP if you win.')){startBattle({id:`arena-${Date.now()}`,type:'arenaChampion',repeatable:true});}}

  function talkSideQuest(id,speaker){const q=SIDE_QUESTS[id],sq=state.sideQuests[id];if(!q||!sq)return;const progress=Math.min(q.goal,cValue(q.counter));if(sq.status==='available'){sq.status='active';addLog(`Guild quest accepted: ${q.name}.`,true);queueDialogue(speaker,[q.desc,'Return when the work is complete. Progress already made will count.']);}
    else if(sq.status==='active'&&progress>=q.goal){sq.status='claimed';grantReward(q.reward,`${q.name} reward`);queueDialogue(speaker,['Excellent work. The guild has recorded the contract as complete.']);chord([523,659,784]);}
    else if(sq.status==='active')queueDialogue(speaker,[`${q.name}: ${progress} of ${q.goal} complete.`]);else queueDialogue(speaker,['This contract is complete. The guild remembers reliable adventurers.']);updateHud();saveGame(true);}

  function openChest(chestId){const chest=currentLocation().chests.find(c=>c.id===chestId);if(!chest)return;if(chest.opened){queueDialogue('Opened Chest',['Only dust and a few heroic fingerprints remain.']);return;}chest.opened=true;grantReward(chest.reward||{},'Treasure found',false);addLog(chest.text,true);queueDialogue('Treasure Chest',[chest.text]);chord([659,784,988]);updateHud();saveGame(true);}
  function grantReward(reward,label='Reward',log=true){const p=state.player;if(reward.gold){p.gold+=reward.gold;state.totalGoldEarned+=reward.gold;}if(reward.potions)p.potions+=reward.potions;if(reward.bombs)p.bombs+=reward.bombs;if(reward.defense)p.defense+=reward.defense;if(reward.exp)gainExp(reward.exp);if(log){const parts=[];if(reward.gold)parts.push(`${reward.gold} gold`);if(reward.potions)parts.push(`${reward.potions} potion${reward.potions===1?'':'s'}`);if(reward.bombs)parts.push(`${reward.bombs} bomb${reward.bombs===1?'':'s'}`);if(reward.exp)parts.push(`${reward.exp} EXP`);addLog(`${label}: ${parts.join(', ')}.`,true);}updateHud();}

  const JOB_BURSTS = {
    vanguard: { name:'SEVENFOLD BREAKER', text:'Sevenfold Breaker shatters armor and fills the stagger gauge!' },
    arcanist: { name:'CROWNFALL NOVA', text:'Crownfall Nova calls a burning star into the battlefield!' },
    ranger: { name:'SKYFANG VOLLEY', text:'Skyfang Volley rains five enchanted arrows!' },
    paladin: { name:'DAWN AEGIS', text:'Dawn Aegis strikes, heals, and raises an unbreakable guard!' },
    rogue: { name:'PHANTOM REQUIEM', text:'Phantom Requiem crosses the enemy before its shadow can move!' },
    cleric: { name:'SERAPHIC JUDGMENT', text:'Seraphic Judgment burns corruption and restores sacred life!' },
    spellblade: { name:'ECLIPSE EDGE', text:'Eclipse Edge joins flame and starlight in one impossible cut!' }
  };

  function setBattleTheme(){
    [...ui.battle.classList].filter(name=>name.startsWith('biome-')).forEach(name=>ui.battle.classList.remove(name));
    ui.battle.classList.add(`biome-${currentLocation().biome}`);
    const colors=currentJob().colors;ui.battleHero.style.setProperty('--hero-hair',colors[0]);ui.battleHero.style.setProperty('--hero-skin',colors[1]);ui.battleHero.style.setProperty('--hero-cloth',colors[2]);ui.battleHero.style.setProperty('--hero-accent',colors[3]);
  }

  function startBattle(enemy){
    const base=ENEMY_TYPES[enemy.type];if(!base)return;
    state.inBattle=true;state.battleLocked=false;state.guarding=false;state.activeEnemyId=enemy.id;
    state.battleCombo=0;state.battleMaxCombo=0;state.battleMomentum=0;state.battleLastAction='';state.battlePerfects=0;state.battleDamageTaken=0;state.battleTurns=0;state.timingActive=false;
    const arenaScale=enemy.repeatable?Math.max(0,state.player.level-5):0;const hp=base.hp+arenaScale*18;
    state.battleEnemy={id:enemy.id,type:enemy.type,name:base.name,hp,maxHp:hp,attack:base.attack+arenaScale*2,exp:base.exp+arenaScale*6,gold:[base.gold[0]+arenaScale*3,base.gold[1]+arenaScale*4],boss:!!base.boss,sprite:base.sprite,repeatable:!!enemy.repeatable,dotTurns:0,dotDamage:0,dotName:'',stunned:false,stagger:0,ward:0,intent:null};
    setBattleTheme();chooseEnemyIntent();ui.battle.classList.remove('hidden');ui.timingPanel.classList.add('hidden');ui.battleLog.textContent=base.intro;
    updateBattleUi();setBattleButtons(false);setTimeout(()=>spawnFx('word',base.boss?'BOSS BATTLE':'ENGAGE!'),100);chord(base.boss?[164,147,131,98]:[196,185,174]);
  }

  function setBattleButtons(disabled){
    document.querySelectorAll('[data-action]').forEach(button=>{
      const burstLocked=button.dataset.action==='burst'&&state.battleMomentum<100;
      button.disabled=disabled||burstLocked;button.style.opacity=(disabled||burstLocked)?'.55':'1';
    });
    ui.burstBtn.classList.toggle('ready',state.battleMomentum>=100&&!disabled);
  }

  function intentInfo(intent){
    const map={
      attack:['STRIKE','A direct attack.',''],
      heavy:['CRUSHING BLOW','Heavy damage. Guarding is strongly advised.','danger'],
      drain:['MANA REND','Damage plus MP drain.','danger'],
      mend:['DARK MENDING','The enemy will recover HP.','support'],
      brace:['IRON WARD','The enemy will reduce your next damaging action.','support'],
      ultimate:['CROWN CATASTROPHE','A devastating boss technique. Guard now!','danger']
    };
    return map[intent]||map.attack;
  }

  function chooseEnemyIntent(){
    const enemy=state.battleEnemy;if(!enemy)return;
    const roll=Math.random(),low=enemy.hp/enemy.maxHp<.35;
    if(low&&roll<.16)enemy.intent='mend';
    else if(enemy.boss&&roll<.30)enemy.intent='ultimate';
    else if(roll<.50)enemy.intent='heavy';
    else if(roll<.63)enemy.intent='drain';
    else if(roll<.74)enemy.intent='brace';
    else enemy.intent='attack';
  }

  function updateBattleUi(){
    const enemy=state.battleEnemy;if(!enemy)return;
    ui.enemyName.textContent=enemy.name.toUpperCase();ui.enemyHpText.textContent=`${Math.max(0,enemy.hp)} / ${enemy.maxHp} HP`;
    ui.enemyHpBar.style.width=`${Math.max(0,enemy.hp/enemy.maxHp*100)}%`;const transient=[...ui.enemySprite.classList].filter(name=>['hit-anim','attack-anim','skill-anim'].includes(name));ui.enemySprite.className=`enemy-sprite ${enemy.sprite}${enemy.stunned?' staggered':''}`;transient.forEach(name=>ui.enemySprite.classList.add(name));
    const statuses=[];if(enemy.dotTurns>0)statuses.push(`${enemy.dotName.toUpperCase()} · ${enemy.dotTurns} TURNS`);if(enemy.ward>0)statuses.push('IRON WARD');if(enemy.stunned)statuses.push('STAGGERED');
    ui.enemyStatus.textContent=statuses.join(' · ');ui.staggerBar.style.width=`${Math.min(100,enemy.stagger||0)}%`;
    const intent=intentInfo(enemy.intent);ui.enemyIntent.innerHTML=`<strong>INTENT: ${intent[0]}</strong><br>${intent[1]}`;ui.enemyIntent.className=`enemy-intent ${intent[2]}`;
    ui.comboText.textContent=`x${state.battleCombo}`;ui.momentumText.textContent=`${Math.floor(state.battleMomentum)}%`;ui.momentumBar.style.width=`${Math.min(100,state.battleMomentum)}%`;
    const p=state.player,hero=[];if(state.guarding)hero.push('GUARD');if(p.attackBuffTurns>0)hero.push(`POWER ${p.attackBuffTurns}`);if(p.evasionTurns>0)hero.push(`EVADE ${p.evasionTurns}`);ui.heroStatus.textContent=hero.join(' · ');
    ui.burstBtn.textContent=state.player.job?JOB_BURSTS[state.player.job].name:'ROADBURST';setBattleButtons(state.battleLocked&&!state.timingActive);updateHud();
  }

  function effectiveAttack(){const base=totalAttack()+state.player.level*2;return state.player.attackBuffTurns>0?Math.floor(base*1.28):base;}
  function spendMp(cost){if(state.player.mp<cost){ui.battleLog.textContent=`Not enough MP. Need ${cost}.`;beep(90);return false;}state.player.mp-=cost;return true;}

  function animateClass(element,className,duration=460){element.classList.remove(className);void element.offsetWidth;element.classList.add(className);setTimeout(()=>element.classList.remove(className),duration);}
  function flashBattle(red=false){ui.battleFlash.className=`battle-flash${red?' red':''}`;void ui.battleFlash.offsetWidth;ui.battleFlash.classList.add('flash');setTimeout(()=>ui.battleFlash.className='battle-flash',320);}
  function spawnFx(kind,text='',target='enemy'){
    const fx=document.createElement('span');
    if(kind==='slash')fx.className='fx-slash';else if(kind==='burst')fx.className='fx-burst';else if(kind==='word'){fx.className='fx-word';fx.textContent=text;}else{fx.className=`fx-number${kind==='heal'?' heal':''}${target==='hero'&&kind!=='heal'?' hero-damage':''}`;fx.textContent=text;fx.style.left=target==='hero'?'22%':'72%';fx.style.top=target==='hero'?'37%':'29%';}
    ui.battleFx.appendChild(fx);setTimeout(()=>fx.remove(),950);
  }

  function advanceCombo(action,bonus=0){
    const varied=state.battleLastAction&&state.battleLastAction!==action;
    state.battleCombo=varied?Math.min(9,state.battleCombo+1):Math.max(1,state.battleCombo-(state.battleLastAction===action?1:0));
    state.battleLastAction=action;state.battleMaxCombo=Math.max(state.battleMaxCombo,state.battleCombo);state.battleMomentum=Math.min(100,state.battleMomentum+8+state.battleCombo*2+bonus);
  }

  function applyEnemyDamage(amount,text,options={}){
    const enemy=state.battleEnemy;let damage=Math.max(1,Math.floor(amount));
    const chainBonus=1+Math.min(.24,state.battleCombo*.03);damage=Math.floor(damage*chainBonus);
    if(enemy.ward>0){damage=Math.max(1,Math.floor(damage*(1-enemy.ward)));enemy.ward=0;text=`Iron Ward softens the hit. ${text}`;}
    enemy.hp-=damage;enemy.stagger=Math.min(100,(enemy.stagger||0)+(options.stagger||8)+Math.floor(damage/enemy.maxHp*32));
    ui.battleLog.textContent=text.replace('{damage}',damage);animateClass(ui.enemySprite,'hit-anim');animateClass(ui.battleHero,options.skill?'skill-anim':'attack-anim');spawnFx('number',`-${damage}`,'enemy');
    if(options.slash!==false)spawnFx('slash');if(options.flash)flashBattle();
    if(enemy.stagger>=100&&enemy.hp>0){enemy.stagger=0;enemy.stunned=true;state.battleMomentum=Math.min(100,state.battleMomentum+15);setTimeout(()=>spawnFx('word','STAGGER!'),120);ui.battleLog.textContent+=` ${enemy.name} is staggered!`;chord([196,147,98]);}
    return damage;
  }

  function damageEnemy(amount,text){return applyEnemyDamage(amount,text,{skill:true,stagger:12,flash:true});}

  function useJobSkill(slot){const p=state.player,enemy=state.battleEnemy,jobId=p.job,skill=currentJob().skills[slot-1];if(!spendMp(skill.cost))return false;const atk=effectiveAttack();let damage=0;
    if(jobId==='vanguard'&&slot===1){damage=applyEnemyDamage(atk*1.65+randomBetween(2,7),'Power Strike crashes for {damage} damage!',{skill:true,stagger:24,flash:true});}
    if(jobId==='vanguard'&&slot===2){damage=damageEnemy(atk*1.05+randomBetween(3,8),'War Cry hits for {damage}; your Attack rises!');p.attackBuffTurns=3;}
    if(jobId==='arcanist'&&slot===1){damage=damageEnemy(15+p.level*4+equippedWeapon().power*1.2+randomBetween(2,8),'Arc Bolt deals {damage} magic damage!');}
    if(jobId==='arcanist'&&slot===2){damage=applyEnemyDamage(29+p.level*6+equippedWeapon().power*1.5+randomBetween(4,12),'Starfall erupts for {damage} damage and ignites the enemy!',{skill:true,stagger:18,flash:true});enemy.dotTurns=3;enemy.dotDamage=7+p.level;enemy.dotName='burn';}
    if(jobId==='ranger'&&slot===1){const hit1=Math.max(1,Math.floor(atk*.72)+randomBetween(1,5)),hit2=Math.max(1,Math.floor(atk*.72)+randomBetween(1,5));damage=applyEnemyDamage(hit1+hit2,'Twin Shot lands twice for {damage} total damage!',{skill:true,stagger:16});}
    if(jobId==='ranger'&&slot===2){damage=damageEnemy(atk*1.12+randomBetween(2,7),'Venom Arrow deals {damage} damage and poisons the enemy!');enemy.dotTurns=4;enemy.dotDamage=5+Math.floor(p.level*.8);enemy.dotName='poison';}
    if(jobId==='paladin'&&slot===1){damage=applyEnemyDamage(atk*1.38+p.level*2+randomBetween(2,8),'Radiant Smite pierces for {damage} holy damage!',{skill:true,stagger:20,flash:true});}
    if(jobId==='paladin'&&slot===2){const healed=Math.min(Math.floor(p.maxHp*.38)+p.level*2,p.maxHp-p.hp);p.hp+=healed;state.guarding=true;ui.battleLog.textContent=`Sanctuary restores ${healed} HP and raises a holy guard.`;spawnFx('heal',`+${healed}`,'hero');animateClass(ui.battleHero,'guard-anim');}
    if(jobId==='rogue'&&slot===1){const crit=Math.random()<.48;damage=applyEnemyDamage(atk*(crit?2.25:1.18)+randomBetween(2,8),crit?'Perfect Backstab! {damage} critical damage!':'Backstab deals {damage} damage.',{skill:true,stagger:crit?25:13,flash:crit});if(crit)spawnFx('word','CRITICAL!');}
    if(jobId==='rogue'&&slot===2){damage=damageEnemy(atk*.95+randomBetween(2,6),'Smoke Veil cuts for {damage}; you fade from sight!');p.evasionTurns=2;}
    if(jobId==='cleric'&&slot===1){damage=damageEnemy(14+p.level*4+equippedWeapon().power+randomBetween(2,7),'Light Spear burns corruption for {damage} damage!');p.mp=Math.min(p.maxMp,p.mp+3);}
    if(jobId==='cleric'&&slot===2){const healed=Math.min(Math.floor(p.maxHp*.52)+p.level*3,p.maxHp-p.hp);p.hp+=healed;ui.battleLog.textContent=`Greater Heal restores ${healed} HP.`;spawnFx('heal',`+${healed}`,'hero');animateClass(ui.battleHero,'skill-anim');}
    if(jobId==='spellblade'&&slot===1){damage=damageEnemy(atk*1.18+p.level*3+randomBetween(3,9),'Flame Arc deals {damage} enchanted damage!');enemy.dotTurns=2;enemy.dotDamage=5+p.level;enemy.dotName='burn';}
    if(jobId==='spellblade'&&slot===2){damage=damageEnemy(atk*1.52+randomBetween(3,9),'Mana Edge strikes for {damage} and returns power!');p.mp=Math.min(p.maxMp,p.mp+5);}
    chord([392,523,784]);return true;
  }

  function startTimingAttack(){
    if(state.timingActive)return;state.timingActive=true;state.battleLocked=true;state.timingStartedAt=performance.now();state.timingDuration=1050;
    ui.timingPanel.classList.remove('hidden');ui.battleLog.textContent='Watch the moving blade. Strike near the center of the golden zone!';setBattleButtons(true);
    const loop=now=>{if(!state.timingActive)return;const elapsed=now-state.timingStartedAt;const progress=Math.min(1,elapsed/state.timingDuration);const ping=progress<=.5?progress*2:(1-progress)*2;state.timingPosition=ping;ui.timingCursor.style.left=`calc(${Math.max(0,Math.min(1,ping))*100}% - 4px)`;if(elapsed>=state.timingDuration){confirmTimingAttack(true);return;}state.timingFrame=requestAnimationFrame(loop);};
    state.timingFrame=requestAnimationFrame(loop);
  }

  function confirmTimingAttack(auto=false){
    if(!state.timingActive)return;cancelAnimationFrame(state.timingFrame);state.timingActive=false;ui.timingPanel.classList.add('hidden');
    const pos=Number(state.timingPosition||0),distance=Math.abs(pos-.5);let quality='LATE',mult=.82,bonus=4,stagger=7;
    if(!auto&&distance<=.045){quality='PERFECT',mult=1.72,bonus=26,stagger=28;state.battlePerfects+=1;state.player.mp=Math.min(state.player.maxMp,state.player.mp+2);}
    else if(!auto&&distance<=.11){quality='GREAT',mult=1.35,bonus=16,stagger=18;}
    else if(!auto&&distance<=.21){quality='GOOD',mult=1.05,bonus=10,stagger=12;}
    const p=state.player,crit=Math.random()<.10+(p.job==='rogue'?.10:0)+(quality==='PERFECT'?.15:0);let raw=(effectiveAttack()+randomBetween(1,7))*mult;if(crit)raw*=1.65;
    advanceCombo('attack',bonus);applyEnemyDamage(raw,`${quality}${crit?' CRITICAL':''}! You deal {damage} damage.`,{stagger,flash:quality==='PERFECT'||crit});if(quality==='PERFECT')spawnFx('word','PERFECT!');else if(crit)spawnFx('word','CRITICAL!');
    beep(quality==='PERFECT'?220:crit?180:130,.09,'sawtooth',.04);finishPlayerTurn();
  }

  function useBurst(){
    if(state.battleMomentum<100)return false;const p=state.player,enemy=state.battleEnemy,atk=effectiveAttack(),burst=JOB_BURSTS[p.job];state.battleMomentum=0;state.battleCombo=Math.min(9,state.battleCombo+2);
    spawnFx('burst');spawnFx('word',burst.name);flashBattle();animateClass(ui.battleHero,'skill-anim',700);chord([196,262,392,523,784]);
    if(p.job==='vanguard'){applyEnemyDamage(atk*2.8+randomBetween(10,22),`${burst.text} {damage} damage!`,{skill:true,stagger:100,flash:true});}
    if(p.job==='arcanist'){applyEnemyDamage(54+p.level*9+equippedWeapon().power*2,`${burst.text} {damage} damage!`,{skill:true,stagger:35,flash:true});enemy.dotTurns=4;enemy.dotDamage=10+p.level*2;enemy.dotName='starfire';}
    if(p.job==='ranger'){applyEnemyDamage(atk*2.45+randomBetween(15,28),`${burst.text} {damage} total damage!`,{skill:true,stagger:45,flash:true});enemy.dotTurns=4;enemy.dotDamage=7+p.level;enemy.dotName='venom';}
    if(p.job==='paladin'){applyEnemyDamage(atk*2.15+p.level*4,`${burst.text} {damage} holy damage!`,{skill:true,stagger:45,flash:true});const heal=Math.min(Math.floor(p.maxHp*.42),p.maxHp-p.hp);p.hp+=heal;state.guarding=true;spawnFx('heal',`+${heal}`,'hero');}
    if(p.job==='rogue'){applyEnemyDamage(atk*3.2+randomBetween(12,26),`${burst.text} {damage} critical damage!`,{skill:true,stagger:42,flash:true});p.evasionTurns=3;}
    if(p.job==='cleric'){applyEnemyDamage(46+p.level*8+equippedWeapon().power*2,`${burst.text} {damage} radiant damage!`,{skill:true,stagger:42,flash:true});const heal=Math.min(Math.floor(p.maxHp*.6),p.maxHp-p.hp);p.hp+=heal;spawnFx('heal',`+${heal}`,'hero');}
    if(p.job==='spellblade'){applyEnemyDamage(atk*2.75+p.level*5,`${burst.text} {damage} eclipse damage!`,{skill:true,stagger:50,flash:true});p.mp=p.maxMp;}
    return true;
  }

  function finishPlayerTurn(){
    const enemy=state.battleEnemy;state.battleTurns+=1;updateBattleUi();if(enemy.hp<=0){state.battleLocked=true;setBattleButtons(true);setTimeout(victory,560);return;}
    state.battleLocked=true;setBattleButtons(true);setTimeout(enemyTurn,760);
  }

  function battleAction(action){
    if(!state.inBattle||!state.battleEnemy||state.battleLocked||state.timingActive)return;const p=state.player;let acted=false;state.guarding=false;
    if(action==='attack'){startTimingAttack();return;}
    if(action==='skill1'){acted=useJobSkill(1);if(acted)advanceCombo('skill1',8);}
    if(action==='skill2'){acted=useJobSkill(2);if(acted)advanceCombo('skill2',12);}
    if(action==='guard'){state.guarding=true;p.mp=Math.min(p.maxMp,p.mp+4);advanceCombo('guard',5);ui.battleLog.textContent='You read the enemy intent, brace for impact, and recover 4 MP.';beep(260,.08,'square',.03);animateClass(ui.battleHero,'guard-anim');acted=true;}
    if(action==='potion'){if(p.potions<1){ui.battleLog.textContent='Your potion pouch is empty.';beep(90);return;}if(p.hp>=p.maxHp){ui.battleLog.textContent='Your HP is already full.';beep(90);return;}p.potions-=1;const healed=Math.min(30+p.level*3,p.maxHp-p.hp);p.hp+=healed;advanceCombo('potion',2);ui.battleLog.textContent=`You recover ${healed} HP.`;spawnFx('heal',`+${healed}`,'hero');chord([523,659]);acted=true;}
    if(action==='bomb'){if(p.bombs<1){ui.battleLog.textContent='You have no Crown Bombs.';beep(90);return;}p.bombs-=1;advanceCombo('bomb',15);const damage=34+p.level*5+randomBetween(0,10);applyEnemyDamage(damage,'The Crown Bomb explodes for {damage} piercing damage!',{stagger:32,flash:true,slash:false});spawnFx('burst');chord([110,165,82]);acted=true;}
    if(action==='burst')acted=useBurst();
    if(acted)finishPlayerTurn();
  }

  function enemyTurn(){
    if(!state.inBattle||!state.battleEnemy)return;const enemy=state.battleEnemy,p=state.player;
    if(enemy.dotTurns>0){enemy.hp-=enemy.dotDamage;enemy.dotTurns-=1;ui.battleLog.textContent=`${enemy.dotName} deals ${enemy.dotDamage} damage to ${enemy.name}.`;spawnFx('number',`-${enemy.dotDamage}`,'enemy');updateBattleUi();if(enemy.hp<=0){setTimeout(victory,520);return;}}
    if(enemy.stunned){enemy.stunned=false;ui.battleLog.textContent=`${enemy.name} is staggered and loses the turn!`;spawnFx('word','OPENING!');chooseEnemyIntent();state.battleLocked=false;setBattleButtons(false);updateBattleUi();return;}
    const intent=enemy.intent||'attack';
    if(intent==='mend'){const heal=Math.max(8,Math.floor(enemy.maxHp*.14));enemy.hp=Math.min(enemy.maxHp,enemy.hp+heal);ui.battleLog.textContent=`${enemy.name} gathers dark energy and restores ${heal} HP.`;spawnFx('heal',`+${heal}`,'enemy');animateClass(ui.enemySprite,'skill-anim');}
    else if(intent==='brace'){enemy.ward=.5;ui.battleLog.textContent=`${enemy.name} raises an Iron Ward. Its next damage taken is reduced.`;spawnFx('word','WARD');}
    else {
      let multiplier=1,label='attacks';if(intent==='heavy'){multiplier=1.52;label='uses Crushing Blow';}if(intent==='drain'){multiplier=.82;label='tears at your mana';}if(intent==='ultimate'){multiplier=1.92;label='unleashes Crown Catastrophe';}
      if(p.evasionTurns>0&&Math.random()<.55){p.evasionTurns-=1;ui.battleLog.textContent=`You read the motion and evade ${enemy.name}'s ${intentInfo(intent)[0].toLowerCase()}!`;animateClass(ui.battleHero,'attack-anim');spawnFx('word','EVADE!');beep(520,.07,'square',.025);chooseEnemyIntent();state.guarding=false;if(p.attackBuffTurns>0)p.attackBuffTurns-=1;state.battleLocked=false;setBattleButtons(false);updateBattleUi();return;}
      let raw=(enemy.attack+randomBetween(0,6))*multiplier;if(state.guarding)raw*=intent==='ultimate'?.38:.43;const damage=Math.max(1,Math.floor(raw)-p.defense-Math.floor(p.level/3));p.hp-=damage;state.battleDamageTaken+=damage;
      if(intent==='drain'){const drained=Math.min(p.mp,5+Math.floor(p.level/5));p.mp-=drained;ui.battleLog.textContent=`${enemy.name} ${label} for ${damage} damage and drains ${drained} MP!`;}
      else ui.battleLog.textContent=`${enemy.name} ${label} for ${damage} damage${state.guarding?' through your guard':''}!`;
      animateClass(ui.enemySprite,'attack-anim');setTimeout(()=>animateClass(ui.battleHero,'hit-anim'),180);spawnFx('number',`-${damage}`,'hero');flashBattle(true);beep(intent==='ultimate'?52:intent==='heavy'?67:80,intent==='ultimate'?.2:.12,'square',.04);
    }
    state.guarding=false;if(p.attackBuffTurns>0)p.attackBuffTurns-=1;if(p.evasionTurns>0&&intent!=='mend'&&intent!=='brace')p.evasionTurns-=1;
    chooseEnemyIntent();updateBattleUi();if(p.hp<=0)setTimeout(defeat,650);else{state.battleLocked=false;setBattleButtons(false);}
  }

  function victory(){const loc=currentLocation(),enemy=state.battleEnemy;if(!enemy)return;const enemyRecord=!enemy.repeatable?loc.enemies.find(e=>e.id===state.activeEnemyId):null;if(enemyRecord)enemyRecord.defeated=true;let rank='C',multiplier=1;if(state.battleDamageTaken===0&&state.battlePerfects>=1&&state.battleMaxCombo>=4){rank='S';multiplier=1.5;}else if(state.battlePerfects>=1||state.battleMaxCombo>=5){rank='A';multiplier=1.28;}else if(state.battleMaxCombo>=3||state.battleDamageTaken<state.player.maxHp*.25){rank='B';multiplier=1.12;}const baseGold=randomBetween(enemy.gold[0],enemy.gold[1]),gold=Math.floor(baseGold*multiplier);state.player.gold+=gold;state.totalGoldEarned+=gold;state.totalBattles+=1;gainExp(enemy.exp);if(rank==='S'&&Math.random()<.45){state.player.bombs+=1;addLog('S-rank bonus: one Crown Bomb.',true);}addLog(`Defeated ${enemy.name} with rank ${rank}. Gained ${gold} gold and ${enemy.exp} EXP.`);processVictory(enemy.type,enemy.repeatable);ui.battleLog.textContent=`VICTORY — RANK ${rank}! ${gold} gold · ${enemy.exp} EXP`;spawnFx('word',`RANK ${rank}`);chord(enemy.boss?[392,523,659,784,1047]:[523,659,784]);setTimeout(()=>{endBattle();if(state.questStage===FINAL_STAGE&&!state.endingSeen)finishStory();},enemy.boss?1350:950);}

  function processVictory(type,repeatable=false){
    if(type==='mossSlime'){if(state.questStage===1)state.counters.moss+=1;if(Math.random()<.35)state.counters.herbs+=1;}
    if(type==='thornWolf'&&state.questStage===4)state.counters.wolves+=1;
    if(['sewerRat','sludge'].includes(type)){state.counters.sewerKills+=1;if(state.questStage===7&&state.keyItems.duskCrystals<4){state.keyItems.duskCrystals+=1;addLog(`Recovered a Dusk Crystal (${state.keyItems.duskCrystals}/4).`,true);}}
    if(type==='sewerTyrant'&&state.questStage===8)setStage(9,'The Sewer Tyrant is defeated. Return to Mayor Orin.');
    if(type==='mireHydra'&&state.questStage===12)setStage(13,'The Mire Hydra is defeated. Return to Brother Ivo.');
    if(type==='oreGolem'&&Math.random()<.4)state.counters.ore+=1;
    if(type==='forgeGuardian'&&state.questStage===16)setStage(17,'The Forge Guardian is defeated. Return to Queen Maela.');
    if(type==='duneScarab'){state.counters.shells+=1;addLog('A Sun Shell was recovered from the scarab.',true);}
    if(type==='sunWyrm'&&state.questStage===20)setStage(21,'The Sun Command is yours. Return to Archivist Lyra.');
    if(type==='prismGolem'&&state.questStage===24)setStage(25,'The Glass Temple is still. Return to Oracle Suri.');
    if(type==='frostShade'&&state.questStage===27)state.counters.shades+=1;
    if(type==='crystalCrawler'&&Math.random()<.45)state.counters.crystals+=1;
    if(type==='iceKnight'&&state.questStage===28)setStage(29,'Edrin is free. Return to Warden Freya.');
    if(type==='tempestRoc'&&state.questStage===32)setStage(33,'The Tempest Roc is defeated. Return to Astronomer Vey.');
    if(['emberGuard','ashMage'].includes(type)&&state.questStage===35)state.counters.guards+=1;
    if(type==='malachar'&&state.questStage===36)setStage(37,'Malachar is defeated. Enter the Crown Core.');
    if(type==='crownDevourer'&&state.questStage===38)setStage(39,'The Crown Devourer is sealed. Dawn returns.');
    if(type==='arenaChampion'&&repeatable){state.counters.arenaWins+=1;addLog(`Arena victory ${state.counters.arenaWins}.`,true);}
    evaluateProgress();
  }

  function evaluateProgress(){
    if(state.questStage===1&&state.counters.moss>=4)setStage(2,'The crown-marked slimes are defeated. Return to Elder Mira.');
    if(state.questStage===4&&state.counters.wolves>=5)setStage(5,'Whisperwood is quiet. Return to Ranger Elowen.');
    if(state.questStage===7&&state.keyItems.duskCrystals>=4)setStage(8,'All Dusk Crystals recovered. Defeat the Sewer Tyrant.');
    if(state.questStage===11&&state.keyItems.mireTotems>=4)setStage(12,'The witchfire is cleansed. Defeat the Mire Hydra.');
    if(state.questStage===15&&state.keyItems.miners>=3)setStage(16,'The miners are safe. Defeat the Forge Guardian.');
    if(state.questStage===19&&state.keyItems.sunSeals>=4)setStage(20,'The Sun Temple is open. Defeat the Sun-Eater Wyrm.');
    if(state.questStage===23&&state.keyItems.mirrorShards>=4)setStage(24,'The mirrors are aligned. Defeat the Prism Golem.');
    if(state.questStage===27&&state.counters.shades>=5)setStage(28,'The shade anchors are broken. Face the Icebound Knight.');
    if(state.questStage===31&&state.keyItems.starKeys>=4)setStage(32,'The Star Keys are aligned. Defeat the Tempest Roc.');
    if(state.questStage===35&&state.counters.guards>=6)setStage(36,'The throne flame is broken. Confront Malachar.');
    if(state.questStage===37&&state.keyItems.coreSigils>=3)setStage(38,'All four commands are united. Face the Crown Devourer.');
    updateHud();
  }

  function defeat(){const p=state.player;p.hp=p.maxHp;p.mp=p.maxMp;const loss=Math.min(p.gold,Math.max(10,Math.floor(p.gold*.1)));p.gold-=loss;const loc=currentLocation(),respawn=loc.shrine||loc.start;p.x=respawn.x;p.y=respawn.y;ui.battleLog.textContent=`The Seven Roads pull you back from defeat. You lose ${loss} gold.`;addLog(`You awaken in ${loc.name}. ${loss} gold was lost.`);setTimeout(endBattle,1000);}
  function endBattle(){cancelAnimationFrame(state.timingFrame);state.timingActive=false;state.inBattle=false;state.battleEnemy=null;state.activeEnemyId=null;state.battleLocked=false;state.guarding=false;state.battleCombo=0;state.battleMaxCombo=0;state.battleMomentum=0;state.battleLastAction='';state.battlePerfects=0;state.battleDamageTaken=0;state.battleTurns=0;state.player.attackBuffTurns=0;state.player.evasionTurns=0;ui.timingPanel.classList.add('hidden');ui.battleFx.innerHTML='';ui.battle.classList.add('hidden');setBattleButtons(false);updateHud();saveGame(true);}
  function gainExp(amount){const p=state.player;p.exp+=amount;while(p.exp>=p.nextExp){p.exp-=p.nextExp;p.level+=1;p.nextExp=Math.floor(p.nextExp*1.29);p.maxHp+=currentJob().hp>=45?8:6;p.hp=p.maxHp;p.maxMp+=currentJob().mp>=22?4:3;p.mp=p.maxMp;p.baseAttack+=1;if(p.level%3===0)p.defense+=1;addLog(`Level up! Rowan reached level ${p.level}.`,true);showToast(`LEVEL ${p.level}!`);chord([523,659,784,1047]);}updateHud();}

  function finishStory(){state.endingSeen=true;state.playSeconds=currentPlaySeconds();sessionStartedAt=Date.now();ui.endingText.textContent='Dusk remembers, Sun reveals, Frost restrains, and Star chooses. Together they close the Ember Crown—not under a ruler, but under the shared will of every village and city you saved.';const claimed=Object.values(state.sideQuests).filter(q=>q.status==='claimed').length;ui.endingStats.innerHTML=`<div><span>PLAY TIME</span><strong>${formatTime(state.playSeconds)}</strong></div><div><span>JOB</span><strong>${escapeHtml(currentJob().name)}</strong></div><div><span>LEVEL</span><strong>${state.player.level}</strong></div><div><span>VICTORIES</span><strong>${state.totalBattles}</strong></div><div><span>WEAPONS</span><strong>${state.player.weapons.length}</strong></div><div><span>GUILD QUESTS</span><strong>${claimed}/6</strong></div><div><span>LORE</span><strong>${state.counters.lore}/${TOTAL_LORE}</strong></div><div><span>AREAS</span><strong>18</strong></div><div><span>STORY</span><strong>100%</strong></div>`;ui.ending.classList.remove('hidden');addLog('The Ember Crown is sealed by the will of the Seven Roads.',true);chord([392,523,659,784,1047,1319]);saveGame(true);}
  function toggleSound(){state.soundOn=!state.soundOn;ui.sound.textContent=state.soundOn?'♪ SOUND':'× MUTED';ui.sound.setAttribute('aria-pressed',String(state.soundOn));if(state.soundOn)beep(660);}

  document.addEventListener('keydown',event=>{const key=event.key.toLowerCase();const handled=['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' ','enter','m','g','escape','1','2','3','4','5','6','7'].includes(key);if(handled)event.preventDefault();if(state.timingActive&&(key===' '||key==='enter')){confirmTimingAttack(false);return;}if(state.inBattle&&!state.battleLocked){const battleKeys={'1':'attack','2':'skill1','3':'skill2','4':'guard','5':'potion','6':'bomb','7':'burst',' ':'attack','enter':'attack'};if(battleKeys[key]){battleAction(battleKeys[key]);return;}}if(key==='escape'){if(!ui.shop.classList.contains('hidden'))closeShop();else if(!ui.gear.classList.contains('hidden'))closeGear();return;}if(key==='g'){if(ui.gear.classList.contains('hidden'))openGear();else closeGear();return;}if(key==='arrowup'||key==='w')move(0,-1);if(key==='arrowdown'||key==='s')move(0,1);if(key==='arrowleft'||key==='a')move(-1,0);if(key==='arrowright'||key==='d')move(1,0);if(key===' '||key==='enter')interact();if(key==='m')toggleSound();});
  document.querySelectorAll('[data-move]').forEach(button=>button.addEventListener('pointerdown',()=>{const directions={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};move(...directions[button.dataset.move]);}));
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>battleAction(button.dataset.action)));
  ui.start.addEventListener('click',startNewGame);ui.continueBtn.addEventListener('click',loadGame);ui.dialogueNext.addEventListener('click',nextDialogue);ui.action.addEventListener('click',interact);ui.sound.addEventListener('click',toggleSound);ui.save.addEventListener('click',()=>saveGame(false));ui.reset.addEventListener('click',resetGame);ui.gearBtn.addEventListener('click',openGear);ui.gearClose.addEventListener('click',closeGear);ui.shopClose.addEventListener('click',closeShop);ui.timingHit.addEventListener('click',()=>confirmTimingAttack(false));ui.explore.addEventListener('click',()=>{ui.ending.classList.add('hidden');drawWorld();});
  window.addEventListener('beforeunload',()=>{if(state.started&&state.player.job)saveGame(true);});

  resetWorld();renderJobSelection();renderLog();updateHud();animate();
})();
