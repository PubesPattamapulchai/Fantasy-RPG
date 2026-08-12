(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const TILE = 40;
  const COLS = 16;
  const ROWS = 12;
  // Keep the historic key so existing players are not stranded by a storage-key rename.
  const SAVE_KEY = 'emberfall-save-v3';
  const SAVE_BACKUP_KEY = 'emberfall-save-backup-v15';
  const FINAL_STAGE = 39;

  const ui = {
    title: document.getElementById('titleScreen'), jobScreen: document.getElementById('jobScreen'), jobGrid: document.getElementById('jobGrid'),
    start: document.getElementById('startBtn'), continueBtn: document.getElementById('continueBtn'),
    dialogue: document.getElementById('dialogueBox'), speaker: document.getElementById('speakerName'), dialogueText: document.getElementById('dialogueText'), dialogueNext: document.getElementById('dialogueNext'),
    battle: document.getElementById('battleScreen'), battleLog: document.getElementById('battleLog'), enemyName: document.getElementById('enemyName'), enemyHpText: document.getElementById('enemyHpText'), enemyHpBar: document.getElementById('enemyHpBar'), enemySprite: document.getElementById('enemySprite'), enemyStatus: document.getElementById('enemyStatusText'),
    battleHero: document.getElementById('battleHero'), heroStatus: document.getElementById('heroStatusText'), battleD20: document.getElementById('battleD20'), rollLabel: document.getElementById('rollLabel'), rollText: document.getElementById('rollText'), armorClassText: document.getElementById('armorClassText'), stanceText: document.getElementById('stanceText'), companionBattleChip: document.getElementById('companionBattleChip'), tacticBtn: document.getElementById('tacticBtn'), inspireBtn: document.getElementById('inspireBtn'), enemyIntent: document.getElementById('enemyIntent'), comboText: document.getElementById('comboText'), momentumText: document.getElementById('momentumText'), momentumBar: document.getElementById('momentumBar'), staggerBar: document.getElementById('staggerBar'), burstBtn: document.getElementById('burstBtn'), battleFx: document.getElementById('battleFx'), battleFlash: document.getElementById('battleFlash'), timingPanel: document.getElementById('timingPanel'), timingTrack: document.getElementById('timingTrack'), timingCursor: document.getElementById('timingCursor'), timingHit: document.getElementById('timingHitBtn'),
    skill1: document.getElementById('skill1Btn'), skill2: document.getElementById('skill2Btn'),
    gear: document.getElementById('gearScreen'), gearBtn: document.getElementById('gearBtn'), gearClose: document.getElementById('gearCloseBtn'), weaponGrid: document.getElementById('weaponGrid'), jobDetails: document.getElementById('jobDetails'), sideQuestList: document.getElementById('sideQuestList'), loreText: document.getElementById('loreText'),
    sheet: document.getElementById('sheetScreen'), sheetBtn: document.getElementById('sheetBtn'), sheetClose: document.getElementById('sheetCloseBtn'), abilityGrid: document.getElementById('abilityGrid'), sheetJob: document.getElementById('sheetJob'), sheetLevel: document.getElementById('sheetLevel'), sheetCompanion: document.getElementById('sheetCompanion'), sheetAC: document.getElementById('sheetAC'), sheetAttackBonus: document.getElementById('sheetAttackBonus'), sheetInspiration: document.getElementById('sheetInspiration'), sheetChecks: document.getElementById('sheetChecks'), sheetArmor: document.getElementById('sheetArmor'), sheetRelic: document.getElementById('sheetRelic'), sheetRenown: document.getElementById('sheetRenown'), sheetRations: document.getElementById('sheetRations'), companionDetails: document.getElementById('companionDetails'), armorGrid: document.getElementById('armorGrid'), relicGrid: document.getElementById('relicGrid'),
    companionScreen: document.getElementById('companionScreen'), companionGrid: document.getElementById('companionGrid'),
    eventScreen: document.getElementById('eventScreen'), eventTitle: document.getElementById('eventTitle'), eventText: document.getElementById('eventText'), eventChoices: document.getElementById('eventChoices'), eventAbility: document.getElementById('eventAbility'), eventRoll: document.getElementById('eventRoll'), eventResult: document.getElementById('eventResult'), eventD20: document.getElementById('eventD20'), eventAttempt: document.getElementById('eventAttemptBtn'), eventInspire: document.getElementById('eventInspireBtn'), eventLeave: document.getElementById('eventLeaveBtn'),
    shop: document.getElementById('shopScreen'), shopTitle: document.getElementById('shopTitle'), shopCopy: document.getElementById('shopCopy'), shopItems: document.getElementById('shopItems'), shopClose: document.getElementById('shopCloseBtn'),
    camp: document.getElementById('campScreen'), campBtn: document.getElementById('campBtn'), campClose: document.getElementById('campCloseBtn'), campLocation: document.getElementById('campLocation'), campStatus: document.getElementById('campStatus'), campRations: document.getElementById('campRations'), campInspiration: document.getElementById('campInspiration'), campScouted: document.getElementById('campScouted'), campPrepared: document.getElementById('campPrepared'), campBond: document.getElementById('campBond'),
    companionAssistBtn: document.getElementById('companionAssistBtn'), partyTacticBtn: document.getElementById('partyTacticBtn'), reactionBtn: document.getElementById('reactionBtn'), positionBtn: document.getElementById('positionBtn'), dodgeBtn: document.getElementById('dodgeBtn'), parryBtn: document.getElementById('parryBtn'), executeBtn: document.getElementById('executeBtn'), environmentBtn: document.getElementById('environmentBtn'), environmentCard: document.getElementById('environmentCard'), staminaText: document.getElementById('staminaText'), staminaBar: document.getElementById('staminaBar'), barrierText: document.getElementById('barrierText'), barrierBar: document.getElementById('barrierBar'), affixDetails: document.getElementById('affixDetails'), initiativeTrack: document.getElementById('initiativeTrack'), intentTimeline: document.getElementById('intentTimeline'), battlePhaseText: document.getElementById('battlePhaseText'), enemyAffinityText: document.getElementById('enemyAffinityText'), difficultyBattleText: document.getElementById('difficultyBattleText'), featureDetails: document.getElementById('featureDetails'), combatRecord: document.getElementById('combatRecord'), lootReveal: document.getElementById('lootReveal'), lootRevealTitle: document.getElementById('lootRevealTitle'), lootRevealItems: document.getElementById('lootRevealItems'),
    build: document.getElementById('buildScreen'), buildBtn: document.getElementById('buildBtn'), buildClose: document.getElementById('buildCloseBtn'), talentGrid: document.getElementById('talentGrid'), talentPointsText: document.getElementById('talentPointsText'), talentPowerText: document.getElementById('talentPowerText'), techniquePreviewText: document.getElementById('techniquePreviewText'), talentResetBtn: document.getElementById('talentResetBtn'), weaponTechniqueBtn: document.getElementById('weaponTechniqueBtn'), surfaceChip: document.getElementById('surfaceChip'), eliteBadge: document.getElementById('eliteBadge'), runestoneGrid: document.getElementById('runestoneGrid'), skillSigilGrid: document.getElementById('skillSigilGrid'), sheetTier: document.getElementById('sheetTier'), sheetRune: document.getElementById('sheetRune'), sheetBond: document.getElementById('sheetBond'), sheetSigil: document.getElementById('sheetSigil'), sheetPartyTactic: document.getElementById('sheetPartyTactic'), sheetBarrier: document.getElementById('sheetBarrier'), miniMap: document.getElementById('miniMap'), miniMapLabel: document.getElementById('miniMapLabel'), worldTierText: document.getElementById('worldTierText'), bondHudText: document.getElementById('bondHudText'),
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

  const ABILITY_SCORES={vanguard:{str:16,dex:11,con:16,int:9,wis:11,cha:12},arcanist:{str:8,dex:12,con:11,int:17,wis:14,cha:10},ranger:{str:11,dex:17,con:13,int:11,wis:15,cha:10},paladin:{str:15,dex:10,con:15,int:9,wis:13,cha:15},rogue:{str:10,dex:18,con:12,int:13,wis:11,cha:14},cleric:{str:11,dex:10,con:14,int:11,wis:17,cha:13},spellblade:{str:13,dex:15,con:13,int:15,wis:10,cha:11}};
  const COMPANIONS={brann:{name:'Brann Stoneward',role:'Shieldbearer',desc:'A stubborn mountain veteran who anchors the party line.',passive:'+1 Armor Class. +2 Strength checks.',abilities:['str']},lyss:{name:'Lyss of the Lantern',role:'Runesage',desc:'A wandering scholar who reads ruins, wards, and forgotten scripts.',passive:'+2 Intelligence/Wisdom checks. Skills can refund 1 MP.',abilities:['int','wis']},pip:{name:'Pip Quickstep',role:'Scout',desc:'A cheerful pathfinder with excellent instincts and faster hands.',passive:'+2 Dexterity checks and +6% critical chance.',abilities:['dex']},mara:{name:'Mara Dawnvoice',role:'Battle Healer',desc:'A temple singer who refuses to leave wounded travelers behind.',passive:'+2 Charisma checks. Heals 10% max HP after victories.',abilities:['cha']}};
  const ROAD_EVENTS=[
    {title:'THE FALLEN WAGON',text:'A merchant wagon has slipped into a ditch. The axle will snap unless someone lifts the frame.',ability:'str',dc:12,success:'You heave the wagon upright. The merchant pays you 34 gold.',fail:'The wagon shifts suddenly and strains your shoulder.',reward:{gold:34},harm:.08},
    {title:'RUNES BENEATH MOSS',text:'Old crown-runes glow beneath the road. The pattern may reveal a cache—or trigger a ward.',ability:'int',dc:13,success:'You solve the sequence and uncover a sealed supply pouch.',fail:'The ward snaps shut in a flash of blue fire.',reward:{gold:24,bombs:1},harm:.09},
    {title:'THE WOUNDED PILGRIM',text:'A feverish pilgrim whispers contradictory directions. Careful observation may reveal what happened.',ability:'wis',dc:12,success:'You read the signs, treat the pilgrim, and gain Inspiration.',fail:'You lose time following a false trail.',reward:{inspiration:1},harm:0},
    {title:'THE BROKEN SKYBRIDGE',text:'A collapsed span leaves only a narrow beam above a ravine.',ability:'dex',dc:14,success:'You cross cleanly and find a forgotten purse.',fail:'You slip, catch the ledge, and take a painful fall.',reward:{gold:46},harm:.12},
    {title:'SPORES IN THE DARK',text:'A cave passage exhales silver spores. Enduring the cloud might reveal a cache.',ability:'con',dc:13,success:'You push through and recover two healing draughts.',fail:'The spores leave you coughing and weakened.',reward:{potions:2},harm:.10},
    {title:'THE SUSPICIOUS TOLL',text:'A self-appointed road warden demands an outrageous toll. A confident argument might end the scam.',ability:'cha',dc:13,success:'Your words turn the bandits against their own scheme.',fail:'The argument goes nowhere, so you leave before steel is drawn.',reward:{gold:52},harm:0}
  ];


  const ARMORS = {
    roadLeathers:{name:'Road Leathers',bonus:0,price:0,minStage:0,desc:'Flexible traveling gear with room for maps, rope, and bad decisions.'},
    moonmail:{name:'Moonmere Ringmail',bonus:1,price:85,minStage:2,desc:'Light rings sewn over blue leather. Reliable without slowing a traveler.'},
    duskcoat:{name:'Greymoor Duskcoat',bonus:2,price:170,minStage:7,desc:'Waxed black coat reinforced with hidden steel scales.'},
    forgeplate:{name:'Ironridge Half Plate',bonus:3,price:310,minStage:14,desc:'Mountain-forged plates balanced for long expeditions.'},
    sunward:{name:'Sunward Lamellar',bonus:3,price:390,minStage:18,desc:'Golden lamellar that turns heat and glancing blades.'},
    frostguard:{name:'Frostguard Harness',bonus:4,price:520,minStage:26,desc:'Blue-steel armor lined with rune-wool and winter charms.'},
    starplate:{name:'Starfall Aegis',bonus:5,price:720,minStage:30,desc:'Meteor-alloy plates etched with tiny moving constellations.'}
  };
  const RELICS = {
    duskAmulet:{name:'Amulet of Dusk Memory',price:0,minStage:0,desc:'+1 Wisdom checks.',checkAbility:'wis',checkBonus:1},
    marshCharm:{name:'Hydra Reed Charm',price:0,minStage:0,desc:'+1 Constitution checks and +2% critical chance.',checkAbility:'con',checkBonus:1,crit:.02},
    ironSignet:{name:'Ironridge Signet',price:0,minStage:0,desc:'+1 Armor Class.',ac:1},
    sunstone:{name:'Sun-Eater Stone',price:0,minStage:0,desc:'+1 attack rolls.',attack:1},
    sageLens:{name:'Prismatic Sage Lens',price:0,minStage:0,desc:'+1 to every ability check.',allChecks:1},
    frostRose:{name:'Frost Rose Brooch',price:0,minStage:0,desc:'Guarding restores 2 extra MP.',guardMp:2},
    skyFeather:{name:'Tempest Feather',price:0,minStage:0,desc:'+4% critical chance.',crit:.04},
    emberShard:{name:'Ember Crown Shard',price:0,minStage:0,desc:'+8% damage.',damage:.08},
    luckyBone:{name:'Wayfarer Lucky Bone',price:175,minStage:6,desc:'+1 Dexterity and Charisma checks.',checkAbilities:['dex','cha'],checkBonus:1},
    lanternEye:{name:'Lantern Eye',price:260,minStage:12,desc:'+1 Intelligence and Wisdom checks.',checkAbilities:['int','wis'],checkBonus:1},
    mooncoin:{name:'Moon-Silver Fortune Coin',price:0,minStage:0,desc:'+3% critical chance and +1 Dexterity checks.',crit:.03,checkAbility:'dex',checkBonus:1,rarity:'uncommon'},
    wardstone:{name:'Wardstone Brooch',price:0,minStage:0,desc:'+1 Armor Class and strengthens class reactions.',ac:1,reaction:.08,rarity:'uncommon'},
    warhorn:{name:'Miniature War Horn',price:0,minStage:0,desc:'+4% damage and builds Momentum faster.',damage:.04,momentum:3,rarity:'rare'},
    runicRing:{name:'Runic Brass Ring',price:0,minStage:0,desc:'+1 attack rolls and +6% skill damage.',attack:1,spellPower:.06,rarity:'rare'},
    oathThread:{name:'Oath-Thread Bracelet',price:0,minStage:0,desc:'+1 to every ability check and stronger reactions.',allChecks:1,reaction:.05,rarity:'rare'},
    stormDie:{name:'Storm-Carved Fate Die',price:0,minStage:0,desc:'+2% critical chance, +1 attack, and faster Momentum.',crit:.02,attack:1,momentum:2,rarity:'epic'}
  };
  const BOSS_RELICS={sewerTyrant:'duskAmulet',mireHydra:'marshCharm',forgeGuardian:'ironSignet',sunWyrm:'sunstone',prismGolem:'sageLens',iceKnight:'frostRose',tempestRoc:'skyFeather',malachar:'emberShard'};
  const ROAD_CHOICE_EVENTS=[
    {title:'THE FALLEN WAGON',text:'A merchant wagon has slipped into a ditch while something howls beyond the hedges.',approaches:[
      {label:'LIFT THE FRAME',ability:'str',dc:12,success:'You wrench the wagon free before the axle snaps.',fail:'The wagon shifts and crushes your shoulder against the bank.',reward:{gold:38,renown:1},harm:.08},
      {label:'BRACE THE AXLE',ability:'int',dc:13,success:'A quick brace and lever save the cargo without brute force.',fail:'Your improvised brace splinters at the worst possible moment.',reward:{gold:26,bombs:1,renown:1},harm:.06},
      {label:'RALLY THE TRAVELERS',ability:'cha',dc:11,success:'You organize everyone into a clean pull and earn their gratitude.',fail:'Everyone pulls at once, in different directions.',reward:{inspiration:1,renown:2},harm:0}
    ]},
    {title:'RUNES BENEATH MOSS',text:'Crown-runes glow under wet moss. A sealed cache hums beneath them.',approaches:[
      {label:'DECIPHER THE SCRIPT',ability:'int',dc:13,success:'You solve the sequence and open the cache safely.',fail:'A blue ward lashes your hands.',reward:{gold:30,bombs:1},harm:.08},
      {label:'READ THE MAGIC',ability:'wis',dc:12,success:'You sense the harmless rune among the traps and touch only that one.',fail:'The magic answers your doubt with a painful spark.',reward:{inspiration:1,gold:20},harm:.05},
      {label:'DISARM THE PLATE',ability:'dex',dc:14,success:'You lift the pressure plate with a knife tip and steal the cache.',fail:'The mechanism snaps shut before you can clear it.',reward:{gold:52},harm:.10}
    ]},
    {title:'THE WOUNDED PILGRIM',text:'A feverish pilgrim lies beside the road, clutching a map marked with three contradictory routes.',approaches:[
      {label:'TREAT THE WOUND',ability:'wis',dc:12,success:'You identify the fever and stabilize the pilgrim.',fail:'You stop the bleeding but worsen the fever.',reward:{inspiration:1,renown:1},harm:0},
      {label:'CALM THE PILGRIM',ability:'cha',dc:11,success:'A steady voice draws out the true route and the name of a hidden cache.',fail:'The pilgrim panics and sends you down a false trail.',reward:{gold:44,renown:1},harm:0},
      {label:'CARRY THEM TO SAFETY',ability:'con',dc:13,success:'You carry the pilgrim for miles without slowing the party.',fail:'The effort leaves you exhausted.',reward:{potions:2,renown:2},harm:.07}
    ]},
    {title:'THE BROKEN SKYBRIDGE',text:'A broken span leaves a long drop and three possible ways across.',approaches:[
      {label:'BALANCE ACROSS',ability:'dex',dc:14,success:'You cross the narrow beam and recover a forgotten purse.',fail:'You slip and slam into the stone ledge.',reward:{gold:50},harm:.12},
      {label:'RIG A ROPE LINE',ability:'int',dc:13,success:'A clever anchor makes the crossing safe for everyone.',fail:'The anchor tears loose halfway across.',reward:{renown:2,inspiration:1},harm:.07},
      {label:'LEAP THE GAP',ability:'str',dc:15,success:'You clear the gap and haul the rope tight from the far side.',fail:'You make the ledge, but only barely.',reward:{gold:70,renown:1},harm:.14}
    ]},
    {title:'SPORES IN THE DARK',text:'Silver spores drift through a cavern passage. A supply chest glints beyond the cloud.',approaches:[
      {label:'ENDURE THE CLOUD',ability:'con',dc:13,success:'You push through and recover two healing draughts.',fail:'The spores leave you coughing and weak.',reward:{potions:2},harm:.10},
      {label:'IDENTIFY THE SPORES',ability:'wis',dc:12,success:'You spot the safe air currents and guide everyone through.',fail:'The spores behave differently than the field guide promised.',reward:{inspiration:1,potions:1},harm:.05},
      {label:'BURN A SAFE PATH',ability:'int',dc:14,success:'A controlled spark clears the spores without igniting the cave.',fail:'The flame flashes hotter than expected.',reward:{bombs:1,gold:35},harm:.09}
    ]},
    {title:'THE SUSPICIOUS TOLL',text:'Three self-appointed wardens demand a toll and insist the road belongs to them.',approaches:[
      {label:'NEGOTIATE',ability:'cha',dc:13,success:'Your argument turns their own rules against them.',fail:'The discussion becomes expensive and unpleasant.',reward:{gold:58,renown:1},harm:0},
      {label:'READ THE LEADER',ability:'wis',dc:12,success:'You expose the leader’s bluff. The others immediately fold.',fail:'You misread which bandit is actually in charge.',reward:{inspiration:1,renown:1},harm:0},
      {label:'SLIP AROUND THEM',ability:'dex',dc:13,success:'You lead the party through a goat path and leave the toll behind.',fail:'Loose gravel announces your escape attempt.',reward:{gold:36},harm:.05}
    ]}
  ];

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

  const WEAPON_AFFIXES = {
    ferocious:{name:'Ferocious',rarity:'magic',desc:'+10% weapon damage.',damage:.10},
    keen:{name:'Keen',rarity:'magic',desc:'+6% critical chance.',crit:.06},
    warding:{name:'Warding',rarity:'magic',desc:'+1 Armor Class.',ac:1},
    precise:{name:'Precise',rarity:'rare',desc:'+1 attack rolls.',attack:1},
    runed:{name:'Runed',rarity:'rare',desc:'+10% skill damage.',skill:.10},
    relentless:{name:'Relentless',rarity:'rare',desc:'+5 Momentum whenever you vary actions.',momentum:5},
    breaker:{name:'Breaker',rarity:'rare',desc:'+14 stagger on damaging actions.',stagger:14},
    sanguine:{name:'Sanguine',rarity:'epic',desc:'Recover 5% of damage dealt as HP.',leech:.05},
    emberforged:{name:'Emberforged',rarity:'epic',desc:'+15% weapon damage and +3% critical chance.',damage:.15,crit:.03}
  };
  const BATTLE_ENVIRONMENTS = {
    grass:{name:'Hanging Lantern',desc:'Drop a burning lantern for fire damage and stagger.',kind:'damage',type:'fire'},
    forest:{name:'Bramble Snare',desc:'Snap thorn-vines around the foe to heavily stagger it.',kind:'control',type:'physical'},
    city:{name:'Powder Cask',desc:'Ignite a forgotten cask for explosive fire damage.',kind:'damage',type:'fire'},
    dungeon:{name:'Crumbling Pillar',desc:'Bring down old masonry for physical damage and massive stagger.',kind:'control',type:'physical'},
    highland:{name:'Monastery Bell',desc:'Ring the ward-bell to gain guard and Momentum.',kind:'defense',type:'radiant'},
    marsh:{name:'Witchfire Pool',desc:'Kick cursed flame across the field for arcane damage.',kind:'damage',type:'arcane'},
    mountainCity:{name:'Forge Chain',desc:'Yank a suspended chain to stagger the enemy and gain advantage.',kind:'control',type:'physical'},
    mine:{name:'Ore Cart',desc:'Release a loaded mine cart for crushing damage.',kind:'damage',type:'physical'},
    desertCity:{name:'Sun Mirror',desc:'Angle a brass mirror to sear the foe with radiant light.',kind:'damage',type:'radiant'},
    desert:{name:'Buried Brazier',desc:'Expose an ember vent and ignite the battlefield.',kind:'damage',type:'fire'},
    oasis:{name:'Healing Spring',desc:'Draw from the spring to recover HP and MP.',kind:'heal',type:'radiant'},
    glass:{name:'Prism Pylon',desc:'Overcharge a mirror pylon for arcane damage and advantage.',kind:'arcane',type:'arcane'},
    snow:{name:'Avalanche Shelf',desc:'Break a snow shelf to stagger and chill the foe.',kind:'control',type:'physical'},
    iceCave:{name:'Crystal Cluster',desc:'Shatter a crystal vein for piercing arcane damage.',kind:'arcane',type:'arcane'},
    starCity:{name:'Astral Lens',desc:'Focus starlight to restore mana and empower the next attack.',kind:'mana',type:'arcane'},
    sky:{name:'Storm Conductor',desc:'Ground a lightning arc through the enemy for huge stagger.',kind:'arcane',type:'arcane'},
    citadel:{name:'Crownfire Brazier',desc:'Turn the citadel flame against its guardian.',kind:'damage',type:'fire'},
    core:{name:'Fractured Crown Rune',desc:'Break a reality-rune for enormous arcane stagger.',kind:'arcane',type:'arcane'}
  };

  const WEAPON_TECHNIQUES = {
    sword:{name:'Crescent Rend',cost:30,desc:'A sweeping cut with high stagger.',type:'physical'},
    axe:{name:'Sunderfall',cost:32,desc:'A brutal chop that lowers enemy Armor.',type:'physical'},
    bow:{name:'Pinning Volley',cost:28,desc:'A ranged burst that grants advantage.',type:'physical'},
    staff:{name:'Veil Pulse',cost:30,desc:'Arcane force that restores MP.',type:'arcane'},
    mace:{name:'Judgment Bell',cost:31,desc:'A crushing radiant strike that braces you.',type:'radiant'},
    dagger:{name:'Nightglass Flurry',cost:27,desc:'Two rapid cuts with increased critical chance.',type:'physical'},
    rapier:{name:'Counterline Lunge',cost:28,desc:'A precise thrust that can ready your reaction.',type:'physical'}
  };
  const ELITE_TRAITS = {
    brutal:{name:'BRUTAL',desc:'Deals heavier weapon damage.',attackMult:1.16},
    ironclad:{name:'IRONCLAD',desc:'Reinforced armor raises its defense.',armor:2},
    swift:{name:'SWIFT',desc:'Acts quickly and attacks with greater accuracy.',initiative:2,attackRoll:2},
    regenerating:{name:'REGENERATING',desc:'Recovers health at the start of its turn.',regen:.045},
    hexbound:{name:'HEXBOUND',desc:'Begins combat by clouding your first attack.',hex:true}
  };
  const TALENTS = {
    ruthlessEdge:{name:'Ruthless Edge',branch:'OFFENSE',level:2,desc:'+8% weapon and technique damage.'},
    keenInstinct:{name:'Keen Instinct',branch:'OFFENSE',level:4,desc:'+5% critical chance.'},
    executioner:{name:'Executioner',branch:'OFFENSE',level:6,desc:'+16% damage against enemies below 35% HP.'},
    platedSoul:{name:'Plated Soul',branch:'SURVIVAL',level:2,desc:'+1 Armor Class.'},
    reserveStep:{name:'Reserve Step',branch:'SURVIVAL',level:4,desc:'Dodge costs 28 Stamina instead of 35.'},
    secondWind:{name:'Second Wind',branch:'SURVIVAL',level:6,desc:'Recover 8% max HP after every victory.'},
    spellEcho:{name:'Spell Echo',branch:'ARCANA',level:2,desc:'+10% damage from job skills.'},
    channeler:{name:'Channeler',branch:'ARCANA',level:4,desc:'Recover 1 MP after every enemy turn and +2 MP when guarding.'},
    terrainMaster:{name:'Terrain Master',branch:'ARCANA',level:6,desc:'+20% battlefield-environment power and stagger.'},
    tactician:{name:'Tactician',branch:'FORTUNE',level:2,desc:'Varying actions builds 8 additional Momentum.'},
    roadFortune:{name:'Road Fortune',branch:'FORTUNE',level:4,desc:'+15% gold from battle victories.'},
    relicSeeker:{name:'Relic Seeker',branch:'FORTUNE',level:6,desc:'Rare relic and affix drop chances are increased.'},
    bloodRush:{name:'Blood Rush',branch:'OFFENSE',level:8,desc:'+12% damage while below half HP.'},
    headsman:{name:'Headsman',branch:'OFFENSE',level:10,desc:'Executions cost 50 Momentum instead of 60 and deal more damage.'},
    duelistGuard:{name:'Duelist Guard',branch:'SURVIVAL',level:8,desc:'Parry costs 17 Stamina and gains +2 on the parry check.'},
    ironPulse:{name:'Iron Pulse',branch:'SURVIVAL',level:10,desc:'Recover 6 extra Stamina after every enemy turn.'},
    elementalConduit:{name:'Elemental Conduit',branch:'ARCANA',level:8,desc:'Runestone elemental bonuses are 50% stronger.'},
    veilRecovery:{name:'Veil Recovery',branch:'ARCANA',level:10,desc:'Persistent surfaces restore 2 additional MP each round.'},
    nemesisHunter:{name:'Nemesis Hunter',branch:'FORTUNE',level:8,desc:'Nemesis enemies grant 20% more gold and improved rare drops.'},
    kindledOath:{name:'Kindled Oath',branch:'FORTUNE',level:10,desc:'Companion bond grows 50% faster and commands recharge sooner.'}
  };
  const DIFFICULTIES = {
    explorer:{name:'EXPLORER',tier:'I',enemyHp:.82,enemyAttack:.84,enemyArmor:-1,reward:1,eliteChance:.08,nemesisChance:0,loot:1,desc:'Story-forward encounters with forgiving combat.'},
    adventurer:{name:'ADVENTURER',tier:'II',enemyHp:1,enemyAttack:1,enemyArmor:0,reward:1,eliteChance:.14,nemesisChance:.03,loot:1,desc:'The intended balanced campaign.'},
    veteran:{name:'VETERAN',tier:'III',enemyHp:1.22,enemyAttack:1.14,enemyArmor:1,reward:1.18,eliteChance:.25,nemesisChance:.12,loot:1.25,desc:'Harder enemies, more elites, richer rewards.'},
    nightmare:{name:'NIGHTMARE',tier:'IV',enemyHp:1.48,enemyAttack:1.28,enemyArmor:2,reward:1.38,eliteChance:.38,nemesisChance:.25,loot:1.55,desc:'Lethal bosses and frequent Nemesis encounters.'}
  };
  const RUNESTONES = {
    ember:{name:'Ember Rune',rarity:'common',desc:'+10% fire damage.',type:'fire',damage:.10},
    veil:{name:'Veil Rune',rarity:'magic',desc:'+10% arcane damage.',type:'arcane',damage:.10},
    fang:{name:'Fang Rune',rarity:'magic',desc:'+8% physical damage.',type:'physical',damage:.08},
    dawn:{name:'Dawn Rune',rarity:'rare',desc:'+12% radiant damage and stronger healing.',type:'radiant',damage:.12,healing:.10},
    venom:{name:'Venom Rune',rarity:'rare',desc:'+12% poison damage.',type:'poison',damage:.12},
    bastion:{name:'Bastion Rune',rarity:'rare',desc:'+1 Armor Class while guarding or parrying.',guardAc:1},
    tempest:{name:'Tempest Rune',rarity:'epic',desc:'+5 Momentum whenever you vary actions.',momentum:5},
    fortune:{name:'Fortune Rune',rarity:'epic',desc:'Improves rare relic, affix, and runestone drops.',loot:.22}
  };
  const RUNESTONE_POOL=['veil','fang','dawn','venom','bastion','tempest','fortune'];
  const SKILL_SIGILS = {
    flow:{name:'Flow Sigil',rarity:'common',desc:'Job skills restore 12 Stamina and build 8 extra Momentum.'},
    echo:{name:'Echo Sigil',rarity:'magic',desc:'Damaging job skills have a 20% chance to repeat 45% of the final hit.'},
    rupture:{name:'Rupture Sigil',rarity:'magic',desc:'Physical skills and weapon techniques inflict +12 stagger. Broken targets take extra damage.'},
    catalyst:{name:'Catalyst Sigil',rarity:'rare',desc:'Fire, arcane, radiant, and poison skills deal +12% damage and surfaces linger longer.'},
    bulwark:{name:'Bulwark Sigil',rarity:'rare',desc:'Guarding and successful parries generate a protective Ward barrier.'},
    predator:{name:'Predator Sigil',rarity:'rare',desc:'+6% critical chance against elites/bosses and executions open at 30% HP.'},
    covenant:{name:'Covenant Sigil',rarity:'epic',desc:'Companion commands are stronger and recover one round faster.'},
    reaver:{name:'Reaver Sigil',rarity:'epic',desc:'+15% damage against enemies below 35% HP.'}
  };
  const SKILL_SIGIL_POOL=['echo','rupture','catalyst','bulwark','predator','covenant','reaver'];
  const PARTY_TACTICS = {
    assault:{name:'ASSAULT',desc:'Companion damage +22%. Fast, aggressive commands.'},
    guardian:{name:'GUARDIAN',desc:'+1 AC. Companion commands generate Ward.'},
    support:{name:'SUPPORT',desc:'Healing/MP support +25%. Companion command recovery is faster.'}
  };
  const BATTLE_SURFACES = {
    fire:{name:'BURNING GROUND',desc:'Enemy takes fire damage each round.',className:'fire'},
    arcane:{name:'CHARGED VEIL',desc:'Enemy Armor -1; hero restores 2 MP each round.',className:'arcane'},
    radiant:{name:'CONSECRATED GROUND',desc:'Hero recovers a little HP each round.',className:'radiant'},
    physical:{name:'RUBBLE FIELD',desc:'Enemy accuracy is reduced and stagger rises each round.',className:'physical'},
    poison:{name:'MIASMA',desc:'Enemy takes poison damage each round.',className:'poison'}
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
      hp: 40, maxHp: 40, mp: 14, maxMp: 14, stamina: 100, maxStamina: 100,
      level: 1, exp: 0, nextExp: 38, gold: 0, potions: 3, bombs: 1,
      baseAttack: 6, defense: 2, equippedWeapon: null, weapons: [], armorTier: 0, equippedArmor:'roadLeathers', armors:['roadLeathers'], equippedRelic:null, relics:[], weaponAffixes:{}, talentPoints:0, talents:{}, runestones:['ember'], equippedRunestone:'ember', skillSigils:['flow'], equippedSkillSigil:'flow', barrier:0,
      attackBuffTurns: 0, evasionTurns: 0
    },
    questStage: 0,
    counters: { moss: 0, wolves: 0, sewerKills: 0, shades: 0, guards: 0, herbs: 0, ore: 0, crystals: 0, shells: 0, lore: 0, arenaWins: 0 },
    keyItems: { duskCrystals: 0, mireTotems: 0, miners: 0, sunSeals: 0, mirrorShards: 0, frostSigil: false, starKeys: 0, crownCommands: 0, coreSigils: 0 },
    sideQuests: initialSideQuests(),
    logs: [], soundOn: true, inBattle: false, battleEnemy: null, battleLocked: false, guarding: false, dialogueQueue: [], activeEnemyId: null,
    battleCombo: 0, battleMaxCombo: 0, battleMomentum: 0, battleLastAction: '', battleFlow: 0, battleFlowReady: false, battleLastDamageType: '', battleReactionCount: 0, battlePerfects: 0, battleDamageTaken: 0, battleTurns: 0, timingActive: false, timingStartedAt: 0, timingDuration: 1150, timingFrame: 0,
    activeShop: null, companion: null, companionBond:0, bondedAt:'', companionTactic:'assault', inspiration: 1, checksSucceeded: 0, checksAttempted: 0, activeRoadEvent: null, selectedRoadApproach: 0, eventFailed: false, difficulty:'adventurer', battleStance: 'balanced', battleRange:'mid', battleCompanionUsed:false, companionCooldown:0, reactionUsed:false, reactionReadied:false, parryPrimed:false, parryCooldown:0, executions:0, battleRound:1, battlePhase:1, initiativeOrder:[], battleActiveActor:'hero', disadvantageNext:false, battleEnvironment:null, environmentUsed:false, dodgePrimed:false, weaponTechniqueCooldown:0, battleSurface:null, eliteVictories:0, nemesisVictories:0, rareFinds:0, runestoneFinds:0, sigilFinds:0, advantageNext: false, rations:3, campedAt:'', roadAdvantage:false, preparedMagic:false, renown:0, choicesMade:0, totalBattles: 0, totalGoldEarned: 0, playSeconds: 0, endingSeen: false, huntStreak:0, huntBest:0, battleTacticalReads:0, battleReadRound:0
  });

  let state = initialState();
  let audioCtx = null;
  let toastTimer = null;
  let lastMove = 0;
  let sessionStartedAt = Date.now();
  let lastClockSecond = -1;
  let lastLegacyMapFrame = 0;
  let pendingDifficulty = 'adventurer';

  function currentLocation() { return locations[state.location]; }
  function currentJob() { return JOBS[state.player.job] || JOBS.vanguard; }
  function equippedWeapon() { return WEAPONS[state.player.equippedWeapon] || WEAPONS.travelerBlade; }
  function equippedArmor(){return ARMORS[state.player.equippedArmor]||ARMORS.roadLeathers;}
  function equippedRelic(){return RELICS[state.player.equippedRelic]||null;}
  function currentAffixIds(){return state.player.weaponAffixes?.[state.player.equippedWeapon]||[];}
  function currentAffixes(){return currentAffixIds().map(id=>WEAPON_AFFIXES[id]).filter(Boolean);}
  function affixBonus(key){return currentAffixes().reduce((sum,a)=>sum+(a[key]||0),0);}
  function hasTalent(id){return !!state.player.talents?.[id];}
  function talentCount(){return Object.values(state.player.talents||{}).filter(Boolean).length;}
  function currentTechnique(){return WEAPON_TECHNIQUES[equippedWeapon().type]||WEAPON_TECHNIQUES.sword;}
  function difficultyData(){return DIFFICULTIES[state.difficulty]||DIFFICULTIES.adventurer;}
  function runestone(){return RUNESTONES[state.player.equippedRunestone]||RUNESTONES.ember;}
  function runeDamageBonus(type){const r=runestone();if(!type||r.type!==type)return 0;return (r.damage||0)*(hasTalent('elementalConduit')?1.5:1);}
  function lootBonus(){return 1+(runestone().loot||0);}
  function skillSigil(){return SKILL_SIGILS[state.player.equippedSkillSigil]||SKILL_SIGILS.flow;}
  function sigilIs(id){return state.player.equippedSkillSigil===id;}
  function partyTactic(){return PARTY_TACTICS[state.companionTactic]||PARTY_TACTICS.assault;}
  function maxBarrier(){return Math.max(12,Math.floor(state.player.maxHp*.42));}
  function gainBarrier(amount,label='WARD'){const p=state.player,cap=maxBarrier(),gain=Math.max(0,Math.min(Math.floor(amount),cap-(p.barrier||0)));p.barrier=Math.min(cap,(p.barrier||0)+gain);if(gain>0){spawnFx('word',`${label} +${gain}`);showToast(`${label} +${gain}`);}return gain;}
  function bondRank(){const b=state.companionBond||0;return b>=75?'OATHBOUND':b>=45?'TRUSTED':b>=20?'ALLY':'STRANGER';}
  function bondMultiplier(){const b=state.companionBond||0;return 1+(b>=75?.28:b>=45?.18:b>=20?.09:0);}
  function parryCost(){return hasTalent('duelistGuard')?17:22;}
  function executionCost(){return hasTalent('headsman')?50:60;}
  function executeReady(){const e=state.battleEnemy;if(!e)return false;const threshold=sigilIs('predator')?.30:.25;return state.battleMomentum>=executionCost()&&(e.stunned||e.broken||e.stagger>=72||e.hp/e.maxHp<=threshold);}
  function gearPower(){const w=equippedWeapon(),a=equippedArmor();return Math.floor(w.power*10+a.bonus*22+state.player.level*6+currentAffixes().length*14+talentCount()*4+(state.player.equippedRelic?18:0)+(state.player.equippedRunestone?10:0)+(state.player.equippedSkillSigil?10:0));}
  function huntRewardMult(){return 1+Math.min(.30,(state.huntStreak||0)*.035);}
  function guideEnabled(){return !document.body.classList.contains('pref-guide-off');}
  function recommendedAction(){
    const e=state.battleEnemy,p=state.player;if(!state.inBattle||!e)return{action:'attack',label:'EXPLORE FREELY',reason:'Guidance appears automatically when combat begins.'};
    if(p.hp<=p.maxHp*.30&&p.potions>0)return{action:'potion',label:'RECOVER NOW',reason:'Low HP threatens your current Hunt Chain.'};
    if(executeReady())return{action:'execute',label:'TAKE THE OPENING',reason:'The enemy is vulnerable and an Execution is ready.'};
    if(['ultimate','heavy'].includes(e.intent)){if(!state.parryPrimed&&state.parryCooldown<=0&&(p.stamina||0)>=parryCost())return{action:'parry',label:'PARRY THE THREAT',reason:`${intentInfo(e.intent)[0]} is coming. A successful Parry counters it.`};if(!state.reactionUsed)return{action:'reaction',label:'READY REACTION',reason:'Your class reaction can blunt this dangerous attack.'};return{action:'guard',label:'FORTIFY',reason:'Guard restores resources and softens the incoming hit.'};}
    if(e.intent==='sweep'&&state.battleRange!=='far')return{action:'position',label:'CREATE DISTANCE',reason:'Wide Sweep is much weaker at FAR range.'};
    if(e.intent==='mend')return{action:'weaponTechnique',label:'PRESS THE ADVANTAGE',reason:'The enemy plans to heal. Use a strong action now.'};
    if((p.stamina||0)<28)return{action:'guard',label:'RECOVER STAMINA',reason:'Guard restores Stamina, MP, and Ward.'};
    if(state.companionCooldown===0&&state.companion&&(state.companionBond||0)>=20&&state.battleMomentum>=70)return{action:'companion',label:'COVENANT SURGE',reason:'Your companion bond and Momentum can empower the next command.'};
    if(state.companionCooldown===0&&state.companion)return{action:'companion',label:'USE THE PARTY',reason:'Your companion command is ready and does not consume your main action.'};
    return{action:'attack',label:'BUILD MOMENTUM',reason:'A timed attack is a reliable way to build combo and stagger.'};
  }
  function updateFriendlyUi(){
    const hunt=document.getElementById('huntText'),power=document.getElementById('gearPowerText'),coach=document.getElementById('combatCoach'),guide=document.getElementById('guideModeText');if(hunt)hunt.textContent=`x${state.huntStreak||0}`;if(power)power.textContent=gearPower();if(guide)guide.textContent=guideEnabled()?'ON':'OFF';
    if(coach){const r=recommendedAction();coach.classList.toggle('guide-off',!guideEnabled());coach.innerHTML=guideEnabled()?`<small>TACTICAL GUIDE · OPTIONAL</small><strong>${escapeHtml(r.label)}</strong><span>${escapeHtml(r.reason)}</span>`:`<small>TACTICAL GUIDE</small><strong>GUIDANCE OFF</strong><span>Enable it in Options whenever you want contextual help.</span>`;document.querySelectorAll('[data-action]').forEach(b=>b.classList.toggle('recommended',guideEnabled()&&b.dataset.action===r.action&&!b.disabled));}
    const huntBattle=document.getElementById('huntBattleText');if(huntBattle)huntBattle.textContent=`HUNT x${state.huntStreak||0}`;
  }
  function rewardTacticalRead(action){if(!guideEnabled()||!state.inBattle||state.battleReadRound===state.battleRound)return;const r=recommendedAction();if(r.action!==action)return;state.battleReadRound=state.battleRound;state.battleTacticalReads=(state.battleTacticalReads||0)+1;state.battleMomentum=Math.min(100,state.battleMomentum+8);state.player.stamina=Math.min(state.player.maxStamina,state.player.stamina+6);spawnFx('word','TACTICAL READ');showToast('TACTICAL READ · +8 MOMENTUM');}
  function enemyTraitIds(enemy){return [enemy?.elite,enemy?.elite2].filter(Boolean);}
  function enemyTraits(enemy){return enemyTraitIds(enemy).map(id=>ELITE_TRAITS[id]).filter(Boolean);}
  function dodgeCost(){return hasTalent('reserveStep')?28:35;}
  function enemyTargetArmor(){const e=state.battleEnemy;if(!e)return 10;return Math.max(7,e.armor-(state.battleSurface?.type==='arcane'?1:0));}
  function surfaceAccuracyPenalty(){return state.battleSurface?.type==='physical'?-1:0;}
  function totalAttack() { return state.player.baseAttack + equippedWeapon().power; }
  function tileAt(x, y) { return currentLocation().map[y]?.[x] || 'W'; }
  function isEnemyVisible(enemy) { return !enemy.defeated && state.questStage >= (enemy.minStage || 0) && state.questStage <= (enemy.maxStage ?? FINAL_STAGE); }
  function isNodeVisible(node) { return !node.collected; }
  function menusOpen() { const settings=document.getElementById('settingsScreen'); return !ui.gear.classList.contains('hidden') || !ui.sheet.classList.contains('hidden') || !ui.shop.classList.contains('hidden') || !ui.jobScreen.classList.contains('hidden') || !ui.companionScreen.classList.contains('hidden') || !ui.eventScreen.classList.contains('hidden') || !ui.camp.classList.contains('hidden') || !ui.build.classList.contains('hidden') || !!(settings&&!settings.classList.contains('hidden')); }


  // Public read-only presentation bridge used by the modern 2D renderer and input layer.
  window.EmberfallBridge = {
    snapshot: () => {
      const loc = currentLocation();
      const enemy = state.battleEnemy;
      return {
        started: !!state.started,
        location: state.location,
        locationData: {
          name: loc.name, short: loc.short, subtitle: loc.subtitle, biome: loc.biome,
          map: [...loc.map],
          decor: (loc.decor || []).map(d => ({ ...d })),
          npcs: (loc.npcs || []).map(n => ({ id:n.id, x:n.x, y:n.y, name:n.name, role:n.role, colors:[...(n.colors||[])] })),
          enemies: (loc.enemies || []).filter(isEnemyVisible).map(e => ({ id:e.id, x:e.x, y:e.y, type:e.type, defeated:!!e.defeated })),
          exits: (loc.exits || []).map(e => ({ x:e.x, y:e.y, label:e.label, target:e.target, minStage:e.minStage||0, unlocked:state.questStage>=(e.minStage||0) })),
          chests: (loc.chests || []).filter(c => !c.opened).map(c => ({ id:c.id, x:c.x, y:c.y })),
          nodes: (loc.nodes || []).filter(isNodeVisible).map(n => ({ id:n.id, x:n.x, y:n.y, type:n.type })),
          shrine: loc.shrine ? { ...loc.shrine } : null
        },
        heroColors: [...(currentJob().colors || [])],
        player: { x:state.player.x, y:state.player.y, facing:state.player.facing, hp:state.player.hp, maxHp:state.player.maxHp, mp:state.player.mp, maxMp:state.player.maxMp, stamina:state.player.stamina, maxStamina:state.player.maxStamina, barrier:state.player.barrier, level:state.player.level },
        inBattle: !!state.inBattle,
        battleLocked: !!state.battleLocked,
        timingActive: !!state.timingActive,
        companion: state.companion,
        companionBond: state.companionBond || 0,
        battleRange: state.battleRange,
        battleStance: state.battleStance,
        battleMomentum: state.battleMomentum,
        battleFlow: state.battleFlow || 0,
        battleFlowReady: !!state.battleFlowReady,
        battleReactionCount: state.battleReactionCount || 0,
        battleLastDamageType: state.battleLastDamageType || '',
        battleSurface: state.battleSurface ? { ...state.battleSurface } : null,
        battleEnemy: enemy ? { id:enemy.id, type:enemy.type, name:enemy.name, hp:enemy.hp, maxHp:enemy.maxHp, attack:enemy.attack, boss:!!enemy.boss, sprite:enemy.sprite, stagger:enemy.stagger, stunned:!!enemy.stunned, broken:!!enemy.broken, intent:enemy.intent, nextIntent:enemy.nextIntent, phase:enemy.phase, elite:enemy.elite, elite2:enemy.elite2 } : null,
        battleLog: ui.battleLog?.textContent || '',
        questStage: state.questStage
      };
    }
  };

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
      if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
      const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),now=audioCtx.currentTime,end=now+Math.max(.025,duration);
      osc.type=type;osc.frequency.setValueAtTime(freq,now);
      gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),Math.min(end,now+.008));gain.gain.exponentialRampToValueAtTime(.0001,end);
      osc.connect(gain);gain.connect(audioCtx.destination);osc.onended=()=>{try{osc.disconnect();gain.disconnect();}catch(_){}};osc.start(now);osc.stop(end+.01);
    } catch (_) {}
  }
  function chord(notes) { notes.forEach((note, i) => setTimeout(() => beep(note, .08, 'square', .028), i * 70)); }
  function escapeHtml(text) { return String(text).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
  function randomBetween(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function abilityScores(){return ABILITY_SCORES[state.player.job]||ABILITY_SCORES.vanguard;}
  function abilityMod(name){return Math.floor(((abilityScores()[name]||10)-10)/2);}
  function companion(){return COMPANIONS[state.companion]||null;}
  function companionCheckBonus(a){const c=companion();return c&&c.abilities.includes(a)?2:0;}
  function relicCheckBonus(a){const r=equippedRelic();if(!r)return 0;if(r.allChecks)return r.allChecks;if(r.checkAbility===a)return r.checkBonus||0;if(r.checkAbilities?.includes(a))return r.checkBonus||0;return 0;}
  function weaponAbility(){const t=equippedWeapon().type;if(['bow','dagger','rapier'].includes(t))return'dex';if(t==='staff')return state.player.job==='cleric'?'wis':'int';return'str';}
  function attackBonus(){let b=abilityMod(weaponAbility())+Math.floor(state.player.level/3)+Math.floor(equippedWeapon().power/5)+(equippedRelic()?.attack||0);if(state.player.job==='vanguard'&&state.battleRange==='close')b+=1;b+=affixBonus('attack');return b;}
  function heroAC(){let ac=10+state.player.defense+equippedArmor().bonus+Math.max(0,Math.floor(abilityMod('dex')/2));if(state.companion==='brann')ac+=1;if(state.inBattle&&state.companion&&state.companionTactic==='guardian')ac+=1;ac+=equippedRelic()?.ac||0;ac+=affixBonus('ac');if(state.battleStance==='bold')ac-=2;if(state.battleStance==='warded')ac+=3;if(state.battleStance==='cunning')ac+=1;if(state.player.job==='paladin'&&state.player.hp<=state.player.maxHp*.5)ac+=1;if(hasTalent('platedSoul'))ac+=1;if(runestone().guardAc&&(state.guarding||state.parryPrimed))ac+=runestone().guardAc;return Math.max(8,ac);}
  function stanceDamageMultiplier(){return state.battleStance==='bold'?1.16:state.battleStance==='warded'?.9:1;}
  function stanceCritBonus(){return (state.battleStance==='cunning'?.08:0)+(equippedRelic()?.crit||0)+affixBonus('crit')+(state.player.job==='ranger'&&state.battleRange==='far'?.05:0)+(hasTalent('keenInstinct')?.05:0)+(sigilIs('predator')&&state.battleEnemy&&(state.battleEnemy.boss||state.battleEnemy.elite)?.06:0);}
  function rangeDamageMultiplier(){const t=equippedWeapon().type,r=state.battleRange;if(['bow','staff'].includes(t))return r==='far'?1.14:r==='close'?.88:1.02;if(['dagger','rapier'].includes(t))return r==='close'?1.10:r==='far'?.90:1.04;return r==='close'?1.13:r==='far'?.82:1;}
  function rangeEnemyAttackMod(){return state.battleRange==='far'?-2:state.battleRange==='close'?1:0;}
  function rollD20(adv=false){const a=randomBetween(1,20);if(!adv)return a;return Math.max(a,randomBetween(1,20));}
  function battleD20(adv=false,dis=false){const a=randomBetween(1,20);if(adv===dis)return a;const b=randomBetween(1,20);return adv?Math.max(a,b):Math.min(a,b);}
  function showBattleRoll(label,roll,mod=0,total=null){if(!ui.battleD20)return;ui.battleD20.classList.remove('rolling','nat20','nat1');void ui.battleD20.offsetWidth;ui.battleD20.classList.add('rolling');if(roll===20)ui.battleD20.classList.add('nat20');if(roll===1)ui.battleD20.classList.add('nat1');ui.battleD20.querySelector('span').textContent=roll;ui.rollLabel.textContent=label.toUpperCase();ui.rollText.textContent=total===null?String(roll):`${roll} ${mod>=0?'+':''}${mod} = ${total}`;}


  function affinityInfo(enemy){
    const archetype=(enemy?.sprite||'').split(' ')[0];
    const table={slime:{weak:'fire',resist:'poison'},wolf:{weak:'fire',resist:null},rat:{weak:'fire',resist:'poison'},wraith:{weak:'radiant',resist:'physical'},beast:{weak:'poison',resist:null},bird:{weak:'arcane',resist:null},golem:{weak:'arcane',resist:'poison'},knight:{weak:'arcane',resist:'physical'},guard:{weak:'radiant',resist:'fire'},mage:{weak:'physical',resist:'arcane'}};
    return table[archetype]||{weak:null,resist:null};
  }
  function affinityMultiplier(enemy,type){const a=affinityInfo(enemy);if(type&&a.weak===type)return 1.25;if(type&&a.resist===type)return .78;return 1;}
  function affinityLabel(enemy){const a=affinityInfo(enemy);const bits=[];if(a.weak)bits.push(`WEAK ${a.weak.toUpperCase()}`);if(a.resist)bits.push(`RESIST ${a.resist.toUpperCase()}`);return bits.length?bits.join(' · '):'NO KNOWN AFFINITY';}
  function classFeature(){return CLASS_FEATURES[state.player.job]||{name:'Wayfarer',desc:'Walk the road and learn by surviving it.'};}
  function classReaction(){return CLASS_REACTIONS[state.player.job]||{name:'ROAD WARD',desc:'Reduce one incoming hit.'};}
  function readyReaction(){if(state.reactionUsed){ui.battleLog.textContent='Your class reaction has already been spent this battle.';beep(90);return false;}state.reactionUsed=true;state.reactionReadied=true;ui.battleLog.textContent=`${classReaction().name} is readied. ${classReaction().desc}`;spawnFx('word','REACTION READY');beep(420,.08,'square',.025);updateBattleUi();return true;}
  function resolveReaction(raw){if(!state.reactionReadied)return{raw,evaded:false,note:''};state.reactionReadied=false;const p=state.player,rBonus=equippedRelic()?.reaction||0;let note=classReaction().name,evaded=false;
    if(p.job==='vanguard'){raw*=Math.max(.42,.62-rBonus);const counter=Math.max(1,Math.floor(effectiveAttack()*.38)),dealt=applyPassiveDamage(counter,'','physical',14);note+=` reduces the blow and counters for ${dealt}.`;}
    if(p.job==='arcanist'){raw*=Math.max(.35,.52-rBonus);p.mp=Math.min(p.maxMp,p.mp+4);note+=' folds the attack into a rune and restores 4 MP.';}
    if(p.job==='ranger'){if(Math.random()<.56+rBonus){raw=0;evaded=true;state.battleMomentum=Math.min(100,state.battleMomentum+18);note+=' carries you completely clear of the strike.';}else{raw*=Math.max(.52,.72-rBonus);note+=' turns a clean hit into a glancing one.';}}
    if(p.job==='paladin'){raw*=Math.max(.38,.55-rBonus);const heal=Math.min(Math.ceil(p.maxHp*.10),p.maxHp-p.hp);p.hp+=heal;if(heal)spawnFx('heal',`+${heal}`,'hero');note+=` absorbs the blow and restores ${heal} HP.`;}
    if(p.job==='rogue'){if(Math.random()<.62+rBonus){raw=0;evaded=true;state.advantageNext=true;note+=' leaves only a shadow behind. Your next attack has advantage.';}else{raw*=Math.max(.48,.68-rBonus);note+=' spoils the enemy’s angle.';}}
    if(p.job==='cleric'){raw*=Math.max(.42,.58-rBonus);const heal=Math.min(Math.ceil(p.maxHp*.14),p.maxHp-p.hp);p.hp+=heal;if(heal)spawnFx('heal',`+${heal}`,'hero');note+=` answers with dawnlight and restores ${heal} HP.`;}
    if(p.job==='spellblade'){raw*=Math.max(.38,.55-rBonus);const counter=Math.max(1,Math.floor(effectiveAttack()*.32+p.level)),dealt=applyPassiveDamage(counter,'','arcane');note+=` bends the force aside and returns ${dealt} arcane damage.`;}
    spawnFx('word','REACTION!');return{raw,evaded,note};
  }
  function checkBossPhase(enemy){if(!enemy?.boss||enemy.hp<=0)return;const ratio=enemy.hp/enemy.maxHp;const next=ratio<=.33?3:ratio<=.66?2:1;if(next<=enemy.phase)return;const jumps=next-enemy.phase;enemy.phase=next;state.battlePhase=next;enemy.attack+=2*jumps;enemy.armor+=jumps;enemy.intent='ultimate';enemy.nextIntent='brace';state.battleMomentum=Math.min(100,state.battleMomentum+12);ui.battle.classList.remove('phase-1','phase-2','phase-3');ui.battle.classList.add(`phase-${next}`);spawnFx('word',`BOSS PHASE ${next}`);shakeBattle(11);flashBattle(true);chord([110,98,82,73]);ui.battleLog.textContent+=` ${enemy.name} enters PHASE ${next}: its attack pattern changes!`; }
  function initiativeHtml(){const order=state.initiativeOrder||[];return order.map(x=>`<span class="initiative-chip ${x.id===state.battleActiveActor?'active':''} ${x.id}"><b>${x.label}</b><small>${x.roll}</small></span>`).join('');}

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
    updateFriendlyUi();
    document.getElementById('jobText').textContent = p.job ? job.name.toUpperCase() : 'WAYFARER';
    document.getElementById('weaponText').textContent = p.equippedWeapon ? weapon.name : 'Choose a job to begin';
    document.getElementById('levelText').textContent = p.level;
    document.getElementById('hpText').textContent = `${Math.max(0,p.hp)} / ${p.maxHp}`;
    document.getElementById('mpText').textContent = `${Math.max(0,p.mp)} / ${p.maxMp}`;
    if(ui.staminaText)ui.staminaText.textContent=`${Math.floor(p.stamina||0)} / ${p.maxStamina||100}`;if(ui.barrierText)ui.barrierText.textContent=`${Math.floor(p.barrier||0)} / ${maxBarrier()}`;
    document.getElementById('expText').textContent = `${p.exp} / ${p.nextExp}`;
    document.getElementById('goldText').textContent = p.gold;
    document.getElementById('potionText').textContent = p.potions;
    document.getElementById('attackText').textContent = p.equippedWeapon ? totalAttack() : p.baseAttack;
    document.getElementById('defenseText').textContent = p.defense;
    document.getElementById('hudACText').textContent = heroAC();
    document.getElementById('rationText').textContent = state.rations;
    if(ui.worldTierText)ui.worldTierText.textContent=difficultyData().tier;
    if(ui.bondHudText)ui.bondHudText.textContent=state.companionBond||0;
    document.getElementById('herbText').textContent = cValue('herbs');
    document.getElementById('oreText').textContent = cValue('ore');
    document.getElementById('crystalText').textContent = cValue('crystals');
    document.getElementById('shellText').textContent = cValue('shells');
    document.getElementById('chapterText').textContent = chapterText();
    document.getElementById('questText').textContent = questText();
    document.getElementById('hpBar').style.width = `${Math.max(0,p.hp / Math.max(1,p.maxHp) * 100)}%`;
    document.getElementById('mpBar').style.width = `${Math.max(0,p.mp / Math.max(1,p.maxMp) * 100)}%`;
    if(ui.staminaBar)ui.staminaBar.style.width=`${Math.max(0,(p.stamina||0)/Math.max(1,p.maxStamina||100)*100)}%`;if(ui.barrierBar)ui.barrierBar.style.width=`${Math.max(0,(p.barrier||0)/Math.max(1,maxBarrier())*100)}%`;
    document.getElementById('expBar').style.width = `${Math.max(0,p.exp / Math.max(1,p.nextExp) * 100)}%`;
    const progress = Math.min(100, Math.round(state.questStage / FINAL_STAGE * 100));
    document.getElementById('campaignBar').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `Story ${progress}%`;
    ui.continueBtn.disabled = !localStorage.getItem(SAVE_KEY) && !localStorage.getItem(SAVE_BACKUP_KEY); ui.continueBtn.style.opacity = ui.continueBtn.disabled ? '.45' : '1';
    const loc = currentLocation(); ui.locationBadge.textContent = loc.short; ui.locationText.textContent = loc.name; ui.locationSubtext.textContent = loc.subtitle;
    ui.playTime.textContent = formatTime(currentPlaySeconds());
    ui.skill1.textContent = `${job.skills[0].name} · ${job.skills[0].cost} MP`; ui.skill2.textContent = `${job.skills[1].name} · ${job.skills[1].cost} MP`;
    ui.loreText.textContent = `${state.counters.lore} / ${TOTAL_LORE}`;if(ui.armorClassText)ui.armorClassText.textContent=heroAC();if(ui.inspireBtn)ui.inspireBtn.textContent=`INSPIRATION ${state.inspiration}`;
    // Hidden menus used to be rebuilt on every HUD refresh. Render them only while visible.
    if(!ui.gear.classList.contains('hidden'))renderGear();
    if(!ui.sheet.classList.contains('hidden'))renderSheet();
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


  function drawTabletopLighting(loc){const dangerous=['forest','dungeon','mine','marsh','glass','iceCave','sky','citadel','core'].includes(loc.biome);const t=Date.now()/1000;if(dangerous){const cx=state.player.x*TILE+TILE/2,cy=state.player.y*TILE+TILE/2,radius=235+Math.sin(t*3)*8,g=ctx.createRadialGradient(cx,cy,58,cx,cy,radius);g.addColorStop(0,'rgba(8,6,4,0)');g.addColorStop(.52,'rgba(8,6,4,.08)');g.addColorStop(1,'rgba(5,3,3,.48)');ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);}ctx.save();ctx.globalAlpha=.16;ctx.strokeStyle='#e2bc69';ctx.lineWidth=1;for(let x=0;x<=canvas.width;x+=TILE){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke();}for(let y=0;y<=canvas.height;y+=TILE){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke();}ctx.globalAlpha=1;ctx.strokeStyle='rgba(226,188,105,.5)';ctx.lineWidth=2;ctx.strokeRect(5,5,canvas.width-10,canvas.height-10);ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillStyle='rgba(246,214,148,.88)';ctx.fillText('N',606,29);ctx.fillText('S',606,62);ctx.fillText('W',589,46);ctx.fillText('E',623,46);ctx.beginPath();ctx.moveTo(606,34);ctx.lineTo(611,46);ctx.lineTo(606,57);ctx.lineTo(601,46);ctx.closePath();ctx.stroke();ctx.fillStyle=`rgba(255,181,82,${.04+Math.sin(t*7)*.018})`;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();}

  function drawCinematicPostFx(loc){
    const t=Date.now()/1000;ctx.save();const vignette=ctx.createRadialGradient(canvas.width*.5,canvas.height*.45,120,canvas.width*.5,canvas.height*.5,420);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(.72,'rgba(0,0,0,.06)');vignette.addColorStop(1,'rgba(0,0,0,.34)');ctx.fillStyle=vignette;ctx.fillRect(0,0,canvas.width,canvas.height);
    const warm=['grass','city','mountainCity','desertCity','desert','oasis','citadel','core'].includes(loc.biome);ctx.globalCompositeOperation='screen';ctx.fillStyle=warm?`rgba(255,148,72,${.022+Math.sin(t*1.7)*.007})`:`rgba(96,148,210,${.025+Math.sin(t*1.4)*.006})`;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='source-over';
    for(let i=0;i<7;i++){const x=(i*137+Math.sin(t*.35+i)*35+640)%640,y=(i*89+Math.cos(t*.42+i)*22+480)%480;ctx.globalAlpha=.05+(i%3)*.018;ctx.fillStyle=warm?'#ffb15c':'#9dd9ff';ctx.beginPath();ctx.arc(x,y,10+(i%3)*5,0,Math.PI*2);ctx.fill();}ctx.restore();
  }

  function drawAscendantAtmosphere(loc){
    const t=Date.now()/1000,cx=state.player.x*TILE+20,cy=state.player.y*TILE+20;ctx.save();
    const dangerous=['forest','dungeon','mine','marsh','glass','iceCave','citadel','core'].includes(loc.biome);
    ctx.globalCompositeOperation='screen';
    const halo=ctx.createRadialGradient(cx,cy,10,cx,cy,dangerous?150:105);halo.addColorStop(0,dangerous?'rgba(255,190,105,.13)':'rgba(255,220,155,.09)');halo.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.globalAlpha=.07;ctx.fillStyle=['snow','iceCave','sky','glass'].includes(loc.biome)?'#a9dbff':'#ffbf76';
    for(let i=0;i<3;i++){const x=((i*250+t*8)%820)-120;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+75,0);ctx.lineTo(x+240,480);ctx.lineTo(x+145,480);ctx.closePath();ctx.fill();}
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.12;ctx.fillStyle=dangerous?'#10131a':'#d6bb8a';
    for(let i=0;i<4;i++){const y=(i*133+(t*7)%160)-60;ctx.fillRect(0,y,640,18+((i%2)*8));}
    ctx.restore();
  }

  function drawVeilforgedAtmosphere(loc){
    const t=Date.now()/1000;ctx.save();
    // Layered low fog adds depth without obscuring readable tiles.
    const fogColor=['snow','iceCave','sky','glass'].includes(loc.biome)?'rgba(145,186,214,.08)':['citadel','core','desert','desertCity'].includes(loc.biome)?'rgba(174,103,65,.065)':'rgba(127,151,135,.055)';
    ctx.globalCompositeOperation='screen';ctx.fillStyle=fogColor;
    for(let i=0;i<5;i++){const y=85+i*84+Math.sin(t*.45+i)*12,x=-120+((t*(6+i)+i*171)%240);ctx.globalAlpha=.38+(i%2)*.12;ctx.beginPath();ctx.ellipse(320+x,y,250+i*16,18+i*2,0,0,Math.PI*2);ctx.fill();}
    // Small light pools around fires, shrines and magical set pieces.
    const lights=[];if(loc.shrine)lights.push({x:loc.shrine.x*TILE+20,y:loc.shrine.y*TILE+20,c:'79,215,255'});
    (loc.decor||[]).forEach(d=>{if(['brazier','flame','campfire','forge','crystal','obelisk','crown'].includes(d.type))lights.push({x:d.x*TILE+20,y:d.y*TILE+20,c:['crystal','obelisk'].includes(d.type)?'122,171,255':'255,141,65'});});
    lights.slice(0,9).forEach((l,i)=>{const r=48+Math.sin(t*2.1+i)*6,g=ctx.createRadialGradient(l.x,l.y,2,l.x,l.y,r);g.addColorStop(0,`rgba(${l.c},.16)`);g.addColorStop(1,`rgba(${l.c},0)`);ctx.fillStyle=g;ctx.globalAlpha=1;ctx.fillRect(l.x-r,l.y-r,r*2,r*2);});
    ctx.globalCompositeOperation='source-over';
    // Directional shadow wash gives dangerous maps a more dramatic silhouette.
    if(['dungeon','mine','marsh','iceCave','citadel','core'].includes(loc.biome)){const shade=ctx.createLinearGradient(0,0,640,480);shade.addColorStop(0,'rgba(0,0,0,.13)');shade.addColorStop(.48,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,0,0,.20)');ctx.fillStyle=shade;ctx.fillRect(0,0,640,480);}
    ctx.restore();
  }

  function drawNightfallAtmosphere(loc){
    const t=Date.now()/1000,cx=state.player.x*TILE+20,cy=state.player.y*TILE+20;ctx.save();
    // Soft contact shadow and halo around the controlled hero makes the top-down world read more like a miniature diorama.
    ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(cx,cy+15,18,8,0,0,Math.PI*2);ctx.fill();
    ctx.globalCompositeOperation='screen';const halo=ctx.createRadialGradient(cx,cy,4,cx,cy,82);halo.addColorStop(0,'rgba(247,203,126,.11)');halo.addColorStop(.55,'rgba(162,118,76,.035)');halo.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=halo;ctx.fillRect(cx-90,cy-90,180,180);
    // Slow drifting motes and edge haze increase perceived depth without changing collision geometry.
    const cold=['snow','iceCave','sky','glass','starCity'].includes(loc.biome);ctx.fillStyle=cold?'#b8ddff':'#e7b773';
    for(let i=0;i<12;i++){const x=(i*151+t*(5+i%4)*2)%700-30,y=(i*71+Math.sin(t*.7+i)*28+520)%520-20;ctx.globalAlpha=.045+(i%3)*.018;ctx.beginPath();ctx.arc(x,y,1+(i%2),0,Math.PI*2);ctx.fill();}
    ctx.globalCompositeOperation='source-over';const edge=ctx.createLinearGradient(0,0,640,0);edge.addColorStop(0,'rgba(4,5,8,.18)');edge.addColorStop(.14,'rgba(4,5,8,0)');edge.addColorStop(.86,'rgba(4,5,8,0)');edge.addColorStop(1,'rgba(4,5,8,.18)');ctx.fillStyle=edge;ctx.globalAlpha=1;ctx.fillRect(0,0,640,480);ctx.restore();
  }

  function drawWorld() {
    ctx.clearRect(0,0,canvas.width,canvas.height); const loc=currentLocation();
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)drawTile(x,y,loc.map[y][x]);
    loc.decor.forEach(drawDecor); loc.exits.forEach(drawExit); drawShrine(loc.shrine); loc.nodes.forEach(drawNode); loc.chests.forEach(drawChest); loc.enemies.forEach(drawEnemy);
    loc.npcs.forEach(npc=>drawCharacter(npc.x,npc.y,npc.colors,'down',npc.role==='cael'));
    drawCharacter(state.player.x,state.player.y,currentJob().colors,state.player.facing);
    drawAmbient(loc);drawTabletopLighting(loc);drawCinematicPostFx(loc);drawAscendantAtmosphere(loc);drawVeilforgedAtmosphere(loc);drawNightfallAtmosphere(loc);
    const cycle=(currentPlaySeconds()%480)/480; if(cycle>.55){ctx.fillStyle=`rgba(20,28,65,${Math.min(.22,(cycle-.55)*.5)})`;ctx.fillRect(0,0,canvas.width,canvas.height);} drawLocationLabel();
  }

  function drawLocationLabel(){ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillStyle='rgba(6,10,18,.76)';ctx.fillRect(215,448,210,22);ctx.fillStyle='#f6c453';ctx.fillText(currentLocation().short,320,463);}
  function updateMiniMap(){if(!ui.miniMap||!state.started)return;const m=ui.miniMap.getContext('2d');m.imageSmoothingEnabled=false;m.clearRect(0,0,ui.miniMap.width,ui.miniMap.height);m.drawImage(canvas,0,0,ui.miniMap.width,ui.miniMap.height);m.strokeStyle='rgba(244,196,92,.95)';m.lineWidth=2;m.strokeRect(state.player.x*10-2,state.player.y*10-2,6,6);if(ui.miniMapLabel)ui.miniMapLabel.textContent=currentLocation().short;}
  const fpsLimiter=window.EmberfallPrefs?.makeFrameLimiter?.()||(()=>true); // optional frame-rate cap (Options > Display & Performance)
  function animate(now=performance.now()){
    if(!fpsLimiter(now)){requestAnimationFrame(animate);return;}
    try{
      if(state.started&&!state.inBattle&&!menusOpen()&&ui.ending.classList.contains('hidden')){
        const modernReady=!!(window.Emberfall2D?.ready?.()&&document.body.classList.contains('modern2d-active'));
        // The legacy canvas remains a real fallback/minimap source, but no longer burns a full
        // render pass every frame while the modern 2D renderer is healthy.
        if(!modernReady||now-lastLegacyMapFrame>=250){drawWorld();updateMiniMap();lastLegacyMapFrame=now;}
      }
      const sec=currentPlaySeconds();if(sec!==lastClockSecond){lastClockSecond=sec;ui.playTime.textContent=formatTime(sec);}
    }catch(err){
      // A single bad frame (e.g. transient null map/state during a transition) must not
      // permanently stop the loop: the modern renderer's own frame() has the same guard,
      // and this legacy path is its fallback/minimap source, so it must keep retrying.
      console.error('Emberfall legacy render loop',err);
    }
    requestAnimationFrame(animate);
  }

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


  function renderCompanionSelection(){ui.companionGrid.innerHTML=Object.entries(COMPANIONS).map(([id,c])=>`<button class="companion-card" data-companion="${id}" type="button"><div class="companion-token ${id}">${c.name.split(' ').map(p=>p[0]).join('').slice(0,2)}</div><h3>${escapeHtml(c.name)}</h3><small>${escapeHtml(c.role)}</small><p>${escapeHtml(c.desc)}</p><strong>${escapeHtml(c.passive)}</strong></button>`).join('');ui.companionGrid.querySelectorAll('[data-companion]').forEach(b=>b.addEventListener('click',()=>selectCompanion(b.dataset.companion)));}
  function selectCompanion(id){if(!COMPANIONS[id])return;state.companion=id;ui.companionScreen.classList.add('hidden');const c=companion();addLog(`${c.name}, ${c.role}, joins Rowan.`,true);addLog('Find Elder Mira near Moonmere’s central well.');updateHud();drawWorld();chord([330,440,660]);queueDialogue('Narrator',[`You walk the ${currentJob().name}'s path, with ${c.name} at your side.`,'The Seven Roads were once held together by oaths, choices, and the strange power of the Ember Crown.','Tonight a red star rises over Moonmere. Somewhere beyond the village, old dice of fate begin to turn.']);saveGame(true);}
  function renderSheet(){
    if(!ui.abilityGrid)return;
    const scores=abilityScores(),c=companion(),rune=runestone(),diff=difficultyData();
    ui.sheetJob.textContent=state.player.job?currentJob().name.toUpperCase():'WAYFARER';
    ui.sheetLevel.textContent=`LEVEL ${state.player.level}`;
    ui.sheetCompanion.textContent=c?`${c.name} · ${c.role}`:'Choose a companion';
    ui.abilityGrid.innerHTML=Object.entries(scores).map(([n,score])=>{
      const m=Math.floor((score-10)/2),party=companionCheckBonus(n),gear=relicCheckBonus(n);
      return`<div><span>${n.toUpperCase()}</span><strong>${score}</strong><small>${m>=0?'+':''}${m}${party?` · +${party} party`:''}${gear?` · +${gear} relic`:''}</small></div>`;
    }).join('');
    ui.sheetAC.textContent=heroAC();
    const ab=attackBonus();ui.sheetAttackBonus.textContent=`${ab>=0?'+':''}${ab}`;
    ui.sheetInspiration.textContent=state.inspiration;
    ui.sheetChecks.textContent=`${state.checksSucceeded}/${state.checksAttempted}`;
    if(ui.sheetArmor)ui.sheetArmor.textContent=equippedArmor().name;
    if(ui.sheetRelic)ui.sheetRelic.textContent=equippedRelic()?.name||'None';
    if(ui.sheetRenown)ui.sheetRenown.textContent=state.renown;
    if(ui.sheetRations)ui.sheetRations.textContent=state.rations;
    if(ui.sheetTier)ui.sheetTier.textContent=`${diff.tier} · ${diff.name}`;
    if(ui.sheetRune)ui.sheetRune.textContent=rune.name;
    if(ui.sheetBond)ui.sheetBond.textContent=`${state.companionBond||0} · ${bondRank()}`;if(ui.sheetSigil)ui.sheetSigil.textContent=skillSigil().name;if(ui.sheetPartyTactic)ui.sheetPartyTactic.textContent=partyTactic().name;if(ui.sheetBarrier)ui.sheetBarrier.textContent=maxBarrier();
    ui.companionDetails.innerHTML=c?`<strong>${escapeHtml(c.name)} · ${escapeHtml(c.role)}</strong><br>${escapeHtml(c.desc)}<br><br>${escapeHtml(c.passive)}<br><br><strong>Bond ${state.companionBond||0} · ${bondRank()}</strong><br>Battle Command: ${escapeHtml(companionAssistName())}. Bond improves command power${bondRank()==='OATHBOUND'?' and accelerates recharge.':'.'}<br><br><strong>Doctrine · ${partyTactic().name}</strong><br>${escapeHtml(partyTactic().desc)}`:'Choose a companion after selecting your job.';
    if(ui.featureDetails){
      const f=classFeature(),reaction=classReaction();
      ui.featureDetails.innerHTML=`<strong>${escapeHtml(f.name)}</strong><br>${escapeHtml(f.desc)}<br><br><strong>Reaction · ${escapeHtml(reaction.name)}</strong><br>${escapeHtml(reaction.desc)}<br><br><strong>Runestone · ${escapeHtml(rune.name)}</strong><br>${escapeHtml(rune.desc)}<br><br><strong>Skill Sigil · ${escapeHtml(skillSigil().name)}</strong><br>${escapeHtml(skillSigil().desc)}`;
    }
    if(ui.affixDetails){
      const aff=currentAffixes();
      ui.affixDetails.innerHTML=aff.length?`<strong>${escapeHtml(equippedWeapon().name)}</strong><br>${aff.map(a=>`<span class="affix-${a.rarity}">${escapeHtml(a.name)}</span> — ${escapeHtml(a.desc)}`).join('<br>')}`:`<strong>${escapeHtml(equippedWeapon().name)}</strong><br>No awakened affixes yet. Earn high battle ranks to reveal modifiers.`;
    }
    if(ui.combatRecord)ui.combatRecord.innerHTML=`Victories <strong>${state.totalBattles}</strong> · Elite victories <strong>${state.eliteVictories||0}</strong> · Nemesis victories <strong>${state.nemesisVictories||0}</strong><br>Executions <strong>${state.executions||0}</strong> · Runestones found <strong>${state.runestoneFinds||0}</strong> · Skill Sigils <strong>${state.sigilFinds||0}</strong> · Rare finds <strong>${state.rareFinds||0}</strong><br>Ward capacity <strong>${maxBarrier()}</strong> · Party doctrine <strong>${partyTactic().name}</strong><br>Constellation <strong>${talentCount()}/${Object.keys(TALENTS).length}</strong> · Unspent points <strong>${state.player.talentPoints||0}</strong><br>World Tier <strong>${diff.tier} · ${diff.name}</strong> · Renown <strong>${state.renown}</strong> · Checks <strong>${state.checksSucceeded}/${state.checksAttempted}</strong>`;
  }
  function openSheet(){if(!state.started||state.inBattle||!ui.dialogue.classList.contains('hidden')||!ui.ending.classList.contains('hidden')||!ui.gear.classList.contains('hidden')||!ui.camp.classList.contains('hidden')||!ui.shop.classList.contains('hidden')||!ui.eventScreen.classList.contains('hidden'))return;renderSheet();ui.sheet.classList.remove('hidden');}
  function closeSheet(){ui.sheet.classList.add('hidden');drawWorld();}

  function renderBuild(){
    if(!ui.talentGrid||!state.player.job)return;const points=state.player.talentPoints||0;ui.talentPointsText.textContent=points;ui.talentPowerText.textContent=`${talentCount()} / ${Object.keys(TALENTS).length}`;ui.techniquePreviewText.textContent=currentTechnique().name;
    const order=['OFFENSE','SURVIVAL','ARCANA','FORTUNE'];
    ui.talentGrid.innerHTML=order.map(branch=>`<section class="talent-branch"><h3>${branch}</h3>${Object.entries(TALENTS).filter(([,t])=>t.branch===branch).map(([id,t])=>{const learned=hasTalent(id),available=state.player.level>=t.level&&points>0;return `<button class="talent-node ${learned?'learned':available?'available':'locked'}" data-talent="${id}" type="button" ${learned||!available?'disabled':''}><span class="node-icon">${learned?'✦':t.level}</span><strong>${escapeHtml(t.name)}</strong><small>${escapeHtml(t.desc)}</small><em>${learned?'LEARNED':state.player.level<t.level?`LEVEL ${t.level}`:'SPEND 1 POINT'}</em></button>`;}).join('')}</section>`).join('');
    ui.talentGrid.querySelectorAll('[data-talent]').forEach(button=>button.addEventListener('click',()=>learnTalent(button.dataset.talent)));
  }
  function learnTalent(id){const t=TALENTS[id];if(!t||hasTalent(id)||(state.player.talentPoints||0)<1||state.player.level<t.level)return;state.player.talents[id]=true;state.player.talentPoints-=1;addLog(`Constellation learned: ${t.name}.`,true);showToast(`ASCENDANT · ${t.name.toUpperCase()}`);chord([392,523,659,988]);renderBuild();updateHud();saveGame(true);}
  function retrainTalents(){const learned=talentCount();if(!learned){showToast('NO CONSTELLATION NODES LEARNED');return;}if(state.player.gold<150){showToast('RETRAINING COSTS 150 GOLD');return;}if(!confirm('Spend 150 gold to refund every constellation point?'))return;state.player.gold-=150;state.player.talentPoints=(state.player.talentPoints||0)+learned;state.player.talents={};addLog(`The Road Constellation was retrained. ${learned} point${learned===1?'':'s'} refunded.`,true);renderBuild();updateHud();saveGame(true);}
  function openBuild(){if(!state.started||state.inBattle||!ui.dialogue.classList.contains('hidden')||!ui.ending.classList.contains('hidden')||!ui.gear.classList.contains('hidden')||!ui.sheet.classList.contains('hidden')||!ui.camp.classList.contains('hidden')||!ui.shop.classList.contains('hidden')||!ui.eventScreen.classList.contains('hidden'))return;renderBuild();ui.build.classList.remove('hidden');}
  function closeBuild(){ui.build.classList.add('hidden');drawWorld();}

  function renderJobSelection() {
    ui.jobGrid.innerHTML = Object.entries(JOBS).map(([id,job]) => `<button class="job-card" data-job="${id}" type="button"><h3>${escapeHtml(job.name)}</h3><p>${escapeHtml(job.desc)}</p><small>HP ${job.hp} · MP ${job.mp} · ATK ${job.attack} · DEF ${job.defense}<br>${escapeHtml(job.skills[0].name)} / ${escapeHtml(job.skills[1].name)}</small></button>`).join('');
    ui.jobGrid.querySelectorAll('[data-job]').forEach(button=>button.addEventListener('click',()=>selectJob(button.dataset.job)));
  }

  function startNewGame() {
    resetWorld(); state=initialState(); state.started=true; state.difficulty=pendingDifficulty; sessionStartedAt=Date.now(); ui.title.classList.add('hidden'); ui.jobScreen.classList.remove('hidden'); ui.ending.classList.add('hidden'); renderJobSelection(); updateHud();
  }

  function selectJob(jobId) {
    const job=JOBS[jobId];if(!job)return;const p=state.player;p.job=jobId;p.maxHp=job.hp;p.hp=job.hp;p.maxMp=job.mp;p.mp=job.mp;p.baseAttack=job.attack;p.defense=job.defense;p.equippedWeapon=job.starter;p.weapons=[job.starter];ui.jobScreen.classList.add('hidden');ui.companionScreen.classList.remove('hidden');addLog(`Rowan takes the path of the ${job.name}.`,true);renderCompanionSelection();updateHud();chord([330,440]);
  }

  function gearDeltaLabel(delta,unit='POWER'){
    if(!Number.isFinite(delta)||delta===0)return '<span class="gear-compare equal">SAME '+unit+'</span>';
    return `<span class="gear-compare ${delta>0?'better':'worse'}">${delta>0?'▲ +':'▼ '}${delta} ${unit}</span>`;
  }
  function weaponRangeHint(type){if(['bow','staff'].includes(type))return'FAR RANGE SPECIALIST';if(['dagger','rapier'].includes(type))return'CLOSE RANGE FINESSE';return'CLOSE RANGE POWER';}

  function renderGear() {
    if(!state.started||!state.player.job)return;
    renderArmorAndRelics();
    const job=currentJob();
    ui.weaponGrid.innerHTML=state.player.weapons.map(id=>{
      const w=WEAPONS[id],equipped=id===state.player.equippedWeapon,aff=(state.player.weaponAffixes?.[id]||[]).map(a=>WEAPON_AFFIXES[a]).filter(Boolean);
      const delta=w.power-equippedWeapon().power,compare=equipped?'<span class="gear-compare equipped-label">CURRENT</span>':gearDeltaLabel(delta,'POWER');
      return `<div class="weapon-card ${equipped?'equipped':''} ${aff.length?'affixed':''}"><div class="gear-card-head"><h4>${escapeHtml(w.name)} ${equipped?'· EQUIPPED':''}</h4>${compare}</div><p><strong>${escapeHtml(w.type.toUpperCase())} · +${w.power} POWER</strong> · ${weaponRangeHint(w.type)}${aff.length?` · ${aff.length} AFFIX${aff.length>1?'ES':''}`:''}<br>${escapeHtml(w.desc)}${aff.length?`<br><em>${aff.map(a=>escapeHtml(a.name)).join(' · ')}</em>`:''}</p><button class="pixel-button compact" data-equip="${id}" type="button" ${equipped?'disabled':''}>${equipped?'EQUIPPED':'EQUIP'}</button></div>`;
    }).join('');
    ui.weaponGrid.querySelectorAll('[data-equip]').forEach(button=>button.addEventListener('click',()=>equipWeapon(button.dataset.equip)));
    if(ui.runestoneGrid){
      ui.runestoneGrid.innerHTML=(state.player.runestones||[]).map(id=>{
        const r=RUNESTONES[id];if(!r)return'';const equipped=id===state.player.equippedRunestone;
        return `<button class="runestone-card rarity-${r.rarity} ${equipped?'equipped':''}" data-rune="${id}" type="button"><span class="rune-glyph">◆</span><strong>${escapeHtml(r.name)}</strong><small>${escapeHtml(r.rarity.toUpperCase())}</small><em>${escapeHtml(r.desc)}</em><b>${equipped?'EQUIPPED':'ATTUNE'}</b></button>`;
      }).join('')||'<p class="record-card">Runestones can drop from elite enemies and high-rank victories.</p>';
      ui.runestoneGrid.querySelectorAll('[data-rune]').forEach(button=>button.addEventListener('click',()=>equipRunestone(button.dataset.rune)));
    }
    if(ui.skillSigilGrid){
      ui.skillSigilGrid.innerHTML=(state.player.skillSigils||[]).map(id=>{
        const s=SKILL_SIGILS[id];if(!s)return'';const equipped=id===state.player.equippedSkillSigil;
        return `<button class="skill-sigil-card rarity-${s.rarity} ${equipped?'equipped':''}" data-sigil="${id}" type="button"><span class="sigil-glyph">✧</span><strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(s.rarity.toUpperCase())}</small><em>${escapeHtml(s.desc)}</em><b>${equipped?'SOCKETED':'SOCKET'}</b></button>`;
      }).join('')||'<p class="record-card">Skill Sigils drop from elite, Nemesis, and high-rank victories.</p>';
      ui.skillSigilGrid.querySelectorAll('[data-sigil]').forEach(button=>button.addEventListener('click',()=>equipSkillSigil(button.dataset.sigil)));
    }
    ui.jobDetails.innerHTML=`<strong>${escapeHtml(job.name)}</strong><br>${escapeHtml(job.desc)}<br><br><strong>${escapeHtml(job.skills[0].name)} (${job.skills[0].cost} MP)</strong><br>${escapeHtml(job.skills[0].desc)}<br><br><strong>${escapeHtml(job.skills[1].name)} (${job.skills[1].cost} MP)</strong><br>${escapeHtml(job.skills[1].desc)}<br><br>Bombs: <strong>${state.player.bombs}</strong> · Arena wins: <strong>${state.counters.arenaWins}</strong><br><br><strong>Weapon Technique · ${escapeHtml(currentTechnique().name)}</strong><br>${escapeHtml(currentTechnique().desc)} · ${currentTechnique().cost} Stamina<br><br><strong>Attuned Runestone · ${escapeHtml(runestone().name)}</strong><br>${escapeHtml(runestone().desc)}<br><br><strong>Socketed Skill Sigil · ${escapeHtml(skillSigil().name)}</strong><br>${escapeHtml(skillSigil().desc)}`;
    ui.sideQuestList.innerHTML=Object.entries(SIDE_QUESTS).map(([id,q])=>{const sq=state.sideQuests[id]||{status:'available'};const progress=Math.min(q.goal,cValue(q.counter));return `<div><strong>${escapeHtml(q.name)}</strong><br>${escapeHtml(q.desc)}<br>${progress}/${q.goal} · ${escapeHtml(sq.status.toUpperCase())}</div>`;}).join('');
    ui.loreText.textContent=`${state.counters.lore} / ${TOTAL_LORE}`;
  }

  function equipRunestone(id){
    if(!RUNESTONES[id]||!(state.player.runestones||[]).includes(id))return;
    state.player.equippedRunestone=id;
    showToast(`${RUNESTONES[id].name.toUpperCase()} ATTUNED`);
    addLog(`${RUNESTONES[id].name} attuned to Rowan's gear.`,true);
    renderGear();updateHud();saveGame(true);
  }
  function equipSkillSigil(id){
    if(!SKILL_SIGILS[id]||!(state.player.skillSigils||[]).includes(id))return;
    state.player.equippedSkillSigil=id;showToast(`${SKILL_SIGILS[id].name.toUpperCase()} SOCKETED`);addLog(`${SKILL_SIGILS[id].name} socketed into Rowan's skill lattice.`,true);renderGear();updateHud();saveGame(true);
  }

  function equipWeapon(id) {
    const weapon=WEAPONS[id],job=currentJob();if(!weapon||!state.player.weapons.includes(id))return;if(!job.weapons.includes(weapon.type)){showToast('YOUR JOB CANNOT USE THAT');return;}state.player.equippedWeapon=id;addLog(`${weapon.name} equipped.`,true);beep(620);updateHud();saveGame(true);
  }

  function renderArmorAndRelics(){
    if(!ui.armorGrid||!ui.relicGrid||!state.player.job)return;
    const currentArmor=equippedArmor();
    ui.armorGrid.innerHTML=Object.entries(ARMORS).filter(([id,a])=>state.questStage>=a.minStage||state.player.armors.includes(id)).map(([id,a])=>{const owned=state.player.armors.includes(id),equipped=state.player.equippedArmor===id,delta=a.bonus-currentArmor.bonus,compare=equipped?'<span class="gear-compare equipped-label">CURRENT</span>':gearDeltaLabel(delta,'AC');return`<button class="equipment-card ${equipped?'equipped':''}" data-armor="${id}" type="button"><span class="gear-card-head"><strong>${escapeHtml(a.name)}</strong>${compare}</span><span>AC +${a.bonus} · ${owned?(equipped?'EQUIPPED':'OWNED'):`${a.price}G`}</span><small>${escapeHtml(a.desc)}</small></button>`}).join('');
    ui.relicGrid.innerHTML=Object.entries(RELICS).filter(([id,r])=>(r.price>0&&state.questStage>=r.minStage)||state.player.relics.includes(id)).map(([id,r])=>{const owned=state.player.relics.includes(id),equipped=state.player.equippedRelic===id;return`<button class="equipment-card relic ${equipped?'equipped':''}" data-relic="${id}" type="button"><strong>${escapeHtml(r.name)}</strong><span>${owned?(equipped?'EQUIPPED':'OWNED'):`${r.price}G`}</span><small>${escapeHtml(r.desc)}</small></button>`}).join('')||'<p class="record-card">Boss relics and rare charms will appear here as you discover them.</p>';
    ui.armorGrid.querySelectorAll('[data-armor]').forEach(b=>b.addEventListener('click',()=>buyOrEquipArmor(b.dataset.armor)));
    ui.relicGrid.querySelectorAll('[data-relic]').forEach(b=>b.addEventListener('click',()=>buyOrEquipRelic(b.dataset.relic)));
  }
  function buyOrEquipArmor(id){const a=ARMORS[id];if(!a)return;if(!state.player.armors.includes(id)){if(state.player.gold<a.price){showToast('NOT ENOUGH GOLD');return;}state.player.gold-=a.price;state.player.armors.push(id);addLog(`Purchased ${a.name}.`,true);}state.player.equippedArmor=id;showToast(`${a.name.toUpperCase()} EQUIPPED`);renderGear();updateHud();saveGame(true);}
  function buyOrEquipRelic(id){const r=RELICS[id];if(!r)return;if(!state.player.relics.includes(id)){if(!r.price||state.player.gold<r.price){showToast(r.price?'NOT ENOUGH GOLD':'RELIC NOT DISCOVERED');return;}state.player.gold-=r.price;state.player.relics.push(id);addLog(`Purchased ${r.name}.`,true);}state.player.equippedRelic=id;showToast(`${r.name.toUpperCase()} EQUIPPED`);renderGear();updateHud();saveGame(true);}

  function openGear() { if(!state.started||state.inBattle||!ui.dialogue.classList.contains('hidden')||!ui.ending.classList.contains('hidden')||!ui.sheet.classList.contains('hidden')||!ui.camp.classList.contains('hidden')||!ui.eventScreen.classList.contains('hidden'))return;renderGear();ui.gear.classList.remove('hidden'); }
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
      ui.shopItems.innerHTML=ids.length?ids.map(id=>{const w=WEAPONS[id],owned=p.weapons.includes(id),equipped=id===p.equippedWeapon,delta=w.power-equippedWeapon().power,compare=equipped?'<span class="gear-compare equipped-label">CURRENT</span>':gearDeltaLabel(delta,'POWER');return `<div class="shop-item"><div><div class="gear-card-head"><h4>${escapeHtml(w.name)} · +${w.power} POWER</h4>${compare}</div><p>${escapeHtml(w.desc)}<br><strong>${escapeHtml(w.type.toUpperCase())}</strong> · ${weaponRangeHint(w.type)}</p></div><button class="pixel-button compact" data-buy-weapon="${id}" type="button" ${owned?'disabled':''}>${owned?'OWNED':`${w.price} GOLD`}</button></div>`;}).join(''):'<div class="record-card">No compatible new weapons are available yet.</div>';
      ui.shopItems.querySelectorAll('[data-buy-weapon]').forEach(button=>button.addEventListener('click',()=>buyWeapon(button.dataset.buyWeapon)));
    } else {
      const items=[{id:'potion',name:'Healing Potion',price:28,desc:'Restores HP during battle.'},{id:'bomb',name:'Crown Bomb',price:45,desc:'Deals heavy defense-piercing damage.'},{id:'ration',name:'Trail Ration',price:16,desc:'Used for camp activities on long expeditions.'},{id:'rest',name:'Full Rest',price:18,desc:'Restores all HP and MP immediately.'}];
      ui.shopItems.innerHTML=items.map(item=>`<div class="shop-item"><div><h4>${item.name}</h4><p>${item.desc}</p></div><button class="pixel-button compact" data-buy-item="${item.id}" type="button">${item.price} GOLD</button></div>`).join('');
      ui.shopItems.querySelectorAll('[data-buy-item]').forEach(button=>button.addEventListener('click',()=>buyConsumable(button.dataset.buyItem)));
    }
  }
  function buyWeapon(id){const w=WEAPONS[id],p=state.player;if(!w||p.weapons.includes(id))return;if(p.gold<w.price){showToast('NOT ENOUGH GOLD');beep(90);return;}p.gold-=w.price;p.weapons.push(id);p.equippedWeapon=id;addLog(`${w.name} purchased and equipped.`,true);chord([220,330,440]);renderShop();updateHud();saveGame(true);}
  function buyConsumable(id){const prices={potion:28,bomb:45,ration:16,rest:18},price=prices[id],p=state.player;if(p.gold<price){showToast('NOT ENOUGH GOLD');return;}p.gold-=price;if(id==='potion')p.potions+=1;if(id==='bomb')p.bombs+=1;if(id==='ration')state.rations=Math.min(9,state.rations+1);if(id==='rest'){p.hp=p.maxHp;p.mp=p.maxMp;}showToast(id==='rest'?'FULLY RESTORED':'PURCHASE COMPLETE');beep(660);renderShop();updateHud();saveGame(true);}
  function closeShop(){ui.shop.classList.add('hidden');state.activeShop=null;drawWorld();}

  function worldSnapshot(){const result={};Object.entries(locations).forEach(([id,loc])=>{result[id]={enemies:Object.fromEntries(loc.enemies.map(e=>[e.id,!!e.defeated])),chests:Object.fromEntries(loc.chests.map(c=>[c.id,!!c.opened])),nodes:Object.fromEntries(loc.nodes.map(n=>[n.id,!!n.collected]))};});return result;}
  function restoreWorld(snapshot={}){Object.entries(locations).forEach(([id,loc])=>{loc.enemies.forEach(e=>{e.defeated=!!snapshot[id]?.enemies?.[e.id];});loc.chests.forEach(c=>{c.opened=!!snapshot[id]?.chests?.[c.id];});loc.nodes.forEach(n=>{n.collected=!!snapshot[id]?.nodes?.[n.id];});});}
  function saveGame(silent=false){
    if(!state.started||!state.player.job)return false;
    const elapsed=currentPlaySeconds();
    const saveState={...state,playSeconds:elapsed,dialogueQueue:[],inBattle:false,battleEnemy:null,battleLocked:false,activeEnemyId:null,activeShop:null,activeRoadEvent:null,eventFailed:false,timingActive:false,timingStartedAt:0,timingFrame:0,battleCombo:0,battleMaxCombo:0,battleMomentum:0,battleLastAction:'',battleFlow:0,battleFlowReady:false,battleLastDamageType:'',battleReactionCount:0,battlePerfects:0,battleDamageTaken:0,battleTurns:0,companionCooldown:0,reactionUsed:false,reactionReadied:false,battleRound:1,battlePhase:1,battleEnvironment:null,environmentUsed:false,dodgePrimed:false,parryPrimed:false,parryCooldown:0,weaponTechniqueCooldown:0,battleSurface:null,initiativeOrder:[],battleActiveActor:'hero',disadvantageNext:false};
    const payload=JSON.stringify({version:11,state:saveState,world:worldSnapshot()});
    try{
      const previous=localStorage.getItem(SAVE_KEY);
      if(previous){try{const parsed=JSON.parse(previous);if(parsed&&parsed.state&&parsed.world)localStorage.setItem(SAVE_BACKUP_KEY,previous);}catch(_){}}
      localStorage.setItem(SAVE_KEY,payload);
    }catch(err){console.warn('Emberfall save failed',err);if(!silent)showToast('SAVE FAILED · STORAGE UNAVAILABLE');return false;}
    updateHud();if(!silent){showToast('ADVENTURE SAVED');beep(660);}return true;
  }

  function applyLoadedSave(save){
    if(!save||![3,4,5,6,7,8,9,10,11].includes(save.version)||!save.state?.player?.job||!JOBS[save.state.player.job])throw new Error('unsupported or incomplete save');
    resetWorld();restoreWorld(save.world||{});const fresh=initialState();
    state={...fresh,...save.state,player:{...fresh.player,...(save.state?.player||{}),talents:{...fresh.player.talents,...(save.state?.player?.talents||{})},runestones:[...new Set([...(fresh.player.runestones||[]),...(save.state?.player?.runestones||[])])],skillSigils:[...new Set([...(fresh.player.skillSigils||[]),...(save.state?.player?.skillSigils||[])])]},counters:{...fresh.counters,...(save.state?.counters||{})},keyItems:{...fresh.keyItems,...(save.state?.keyItems||{})},sideQuests:{...initialSideQuests(),...(save.state?.sideQuests||{})},started:true,inBattle:false,battleEnemy:null,battleLocked:false,dialogueQueue:[],activeEnemyId:null,activeShop:null};
    if(!locations[state.location])state.location='moonmere';
    if(!COMPANIONS[state.companion])state.companion={vanguard:'brann',arcanist:'lyss',ranger:'pip',paladin:'mara',rogue:'pip',cleric:'mara',spellblade:'lyss'}[state.player.job]||'brann';
    if(save.version<6){state.player.talentPoints=Math.max(state.player.talentPoints||0,Math.floor(state.player.level/2));state.player.talents={};}
    sessionStartedAt=Date.now();ui.title.classList.add('hidden');ui.jobScreen.classList.add('hidden');ui.dialogue.classList.add('hidden');ui.battle.classList.add('hidden');ui.gear.classList.add('hidden');ui.sheet.classList.add('hidden');ui.camp.classList.add('hidden');ui.build.classList.add('hidden');ui.companionScreen.classList.add('hidden');ui.eventScreen.classList.add('hidden');ui.shop.classList.add('hidden');ui.ending.classList.add('hidden');addLog('Your long road continues.',true);updateHud();drawWorld();chord([440,554,660]);
  }

  function loadGame(){
    const candidates=[['primary',localStorage.getItem(SAVE_KEY)],['backup',localStorage.getItem(SAVE_BACKUP_KEY)]];let lastError=null;
    for(const [kind,raw] of candidates){if(!raw)continue;try{const save=JSON.parse(raw);applyLoadedSave(save);if(kind==='backup'){try{localStorage.setItem(SAVE_KEY,raw);}catch(_){}showToast('RECOVERED BACKUP SAVE');}return;}catch(err){lastError=err;resetWorld();state=initialState();}}
    console.warn('Emberfall save recovery failed',lastError);showToast('SAVE COULD NOT BE RECOVERED');
  }
  function resetGame(){if(!confirm('Erase your local Emberfall save and restart the campaign?'))return;localStorage.removeItem(SAVE_KEY);localStorage.removeItem(SAVE_BACKUP_KEY);resetWorld();state=initialState();sessionStartedAt=Date.now();ui.title.classList.remove('hidden');ui.jobScreen.classList.add('hidden');ui.dialogue.classList.add('hidden');ui.battle.classList.add('hidden');ui.gear.classList.add('hidden');ui.sheet.classList.add('hidden');ui.camp.classList.add('hidden');ui.build.classList.add('hidden');ui.companionScreen.classList.add('hidden');ui.eventScreen.classList.add('hidden');ui.shop.classList.add('hidden');ui.ending.classList.add('hidden');renderLog();updateHud();}

  function move(dx,dy){
    if(!state.started||!state.player.job||state.inBattle||menusOpen()||!ui.dialogue.classList.contains('hidden')||!ui.ending.classList.contains('hidden'))return;
    const now=Date.now();if(now-lastMove<55)return;lastMove=now;const nx=state.player.x+dx,ny=state.player.y+dy;state.player.facing=dx<0?'left':dx>0?'right':dy<0?'up':'down';if(isBlocked(nx,ny)){beep(100,.04,'square',.02);return;}state.player.x=nx;state.player.y=ny;beep(150+((nx+ny)%2)*25,.025,'square',.015);checkTile();
  }
  function checkTile(){
    const loc=currentLocation();const enemy=loc.enemies.find(e=>isEnemyVisible(e)&&e.x===state.player.x&&e.y===state.player.y);if(enemy){startBattle(enemy);return;}
    if(loc.shrine&&state.player.x===loc.shrine.x&&state.player.y===loc.shrine.y){state.player.hp=state.player.maxHp;state.player.mp=state.player.maxMp;showToast('THE SHRINE RESTORES YOU');addLog(`The shrine of ${loc.name} restores your strength.`);chord([392,523,659]);updateHud();}
    const exit=loc.exits.find(e=>e.x===state.player.x&&e.y===state.player.y);if(exit){if(state.questStage<(exit.minStage||0)){showToast('THE WAY IS SEALED');queueDialogue('Locked Passage',[exit.locked||'The road is not yet open.']);stepAwayFromEdge(exit);}else travel(exit.target,exit.targetPos,exit.label);}
  }
  function stepAwayFromEdge(exit){if(exit.x===0)state.player.x=1;else if(exit.x===COLS-1)state.player.x=COLS-2;else if(exit.y===0)state.player.y=1;else if(exit.y===ROWS-1)state.player.y=ROWS-2;}

  function renderRoadApproaches(){const e=state.activeRoadEvent;if(!e||!ui.eventChoices)return;ui.eventChoices.innerHTML=e.approaches.map((a,i)=>`<button class="event-choice ${i===state.selectedRoadApproach?'selected':''}" data-event-choice="${i}" type="button"><strong>${escapeHtml(a.label)}</strong><span>${a.ability.toUpperCase()} · DC ${a.dc}</span></button>`).join('');ui.eventChoices.querySelectorAll('[data-event-choice]').forEach(b=>b.addEventListener('click',()=>selectRoadApproach(Number(b.dataset.eventChoice))));}
  function selectRoadApproach(index){const e=state.activeRoadEvent;if(!e||!e.approaches[index])return;state.selectedRoadApproach=index;const a=e.approaches[index],mod=abilityMod(a.ability)+companionCheckBonus(a.ability)+relicCheckBonus(a.ability);ui.eventAbility.textContent=`${a.ability.toUpperCase()} CHECK · MOD ${mod>=0?'+':''}${mod}`;ui.eventRoll.textContent=`DC ${a.dc}${state.roadAdvantage?' · ADVANTAGE':''}`;ui.eventAttempt.disabled=false;ui.eventAttempt.textContent=`ROLL · ${a.label}`;renderRoadApproaches();}
  function maybeTriggerRoadEvent(){if(state.questStage<2||state.inBattle||menusOpen()||Math.random()>.42)return;const e=ROAD_CHOICE_EVENTS[randomBetween(0,ROAD_CHOICE_EVENTS.length-1)];state.activeRoadEvent=JSON.parse(JSON.stringify(e));state.selectedRoadApproach=0;ui.eventTitle.textContent=e.title;ui.eventText.textContent=e.text;ui.eventResult.textContent='';ui.eventAttempt.classList.remove('hidden');ui.eventAttempt.disabled=false;ui.eventInspire.classList.add('hidden');ui.eventLeave.textContent='WALK AWAY';ui.eventD20.querySelector('span').textContent='20';ui.eventScreen.classList.remove('hidden');renderRoadApproaches();selectRoadApproach(0);}
  function applyRoadReward(r={}){const p=state.player;if(r.gold){p.gold+=r.gold;state.totalGoldEarned+=r.gold;}if(r.potions)p.potions+=r.potions;if(r.bombs)p.bombs+=r.bombs;if(r.inspiration)state.inspiration=Math.min(3,state.inspiration+r.inspiration);if(r.renown)state.renown+=r.renown;}
  function attemptRoadEvent(useInspiration=false){const e=state.activeRoadEvent;if(!e)return;const a=e.approaches[state.selectedRoadApproach||0];if(!a)return;if(useInspiration){if(state.inspiration<1)return;state.inspiration-=1;ui.eventInspire.classList.add('hidden');}state.checksAttempted+=1;state.choicesMade+=1;const mod=abilityMod(a.ability)+companionCheckBonus(a.ability)+relicCheckBonus(a.ability),adv=useInspiration||state.roadAdvantage,roll=rollD20(adv),total=roll+mod;state.roadAdvantage=false;ui.eventD20.classList.remove('rolling','nat20','nat1');void ui.eventD20.offsetWidth;ui.eventD20.classList.add('rolling');if(roll===20)ui.eventD20.classList.add('nat20');if(roll===1)ui.eventD20.classList.add('nat1');ui.eventD20.querySelector('span').textContent=roll;ui.eventRoll.textContent=`${roll} ${mod>=0?'+':''}${mod} = ${total} · DC ${a.dc}`;const success=roll===20||(roll!==1&&total>=a.dc);ui.eventAttempt.classList.add('hidden');ui.eventChoices.querySelectorAll('button').forEach(b=>b.disabled=true);if(success){state.checksSucceeded+=1;applyRoadReward(a.reward);ui.eventResult.innerHTML=`<strong>SUCCESS.</strong> ${escapeHtml(a.success)}`;ui.eventInspire.classList.add('hidden');ui.eventLeave.textContent='CONTINUE';addLog(`${e.title}: ${a.label} succeeded.`,true);chord([440,554,660]);}else{const harm=Math.floor(state.player.maxHp*(a.harm||0));if(harm)state.player.hp=Math.max(1,state.player.hp-harm);ui.eventResult.innerHTML=`<strong>FAILED.</strong> ${escapeHtml(a.fail)}${harm?` Lost ${harm} HP.`:''}`;if(state.inspiration>0&&!useInspiration)ui.eventInspire.classList.remove('hidden');ui.eventLeave.textContent='CONTINUE';beep(92,.16,'square',.04);}updateHud();saveGame(true);}
  function closeRoadEvent(){state.activeRoadEvent=null;ui.eventScreen.classList.add('hidden');drawWorld();}

  function travel(target,targetPos){if(!locations[target])return;state.location=target;state.campedAt='';state.player.x=targetPos.x;state.player.y=targetPos.y;state.player.facing='down';const loc=currentLocation();showToast(loc.short);addLog(`Arrived at ${loc.name}.`,true);chord([330,440,554]);updateHud();saveGame(true);drawWorld();setTimeout(maybeTriggerRoadEvent,520);}


  function renderCamp(){
    if(!ui.camp)return;
    ui.campLocation.textContent=currentLocation().name.toUpperCase();
    ui.campRations.textContent=state.rations;
    ui.campInspiration.textContent=state.inspiration;
    ui.campScouted.textContent=state.roadAdvantage?'YES':'NO';
    ui.campPrepared.textContent=state.preparedMagic?'YES':'NO';
    if(ui.campBond)ui.campBond.textContent=`${state.companionBond||0} · ${bondRank()}`;
    const used=state.campedAt===state.location,bonded=state.bondedAt===state.location;
    ui.campStatus.textContent=used?'The party has already taken a rest activity here. Fireside talk may still be available.':'Choose a rest activity, or talk with your companion by the fire.';
    document.querySelectorAll('[data-camp]').forEach(b=>{
      const isBond=b.dataset.camp==='bond';
      b.disabled=isBond?bonded:used;
    });
  }
  function openCamp(){if(!state.started||state.inBattle||!ui.dialogue.classList.contains('hidden')||!ui.ending.classList.contains('hidden')||menusOpen())return;renderCamp();ui.camp.classList.remove('hidden');}
  function closeCamp(){ui.camp.classList.add('hidden');drawWorld();}
  function campAction(kind){
    const p=state.player,c=companion();
    if(kind==='bond'){
      if(state.bondedAt===state.location){ui.campStatus.textContent='You have already shared a fireside conversation in this area.';beep(90);return;}
      if(!c){ui.campStatus.textContent='There is no companion here to speak with.';return;}
      const gain=hasTalent('kindledOath')?9:6;
      state.companionBond=Math.min(100,(state.companionBond||0)+gain);
      state.bondedAt=state.location;
      if(state.companionBond>=45)state.inspiration=Math.min(3,state.inspiration+1);
      const lines={
        brann:'Brann speaks about the walls he failed to hold—and the people he still intends to protect.',
        lyss:'Lyss sketches old runes in the ash and admits that certainty frightens her more than magic.',
        pip:'Pip tells a ridiculous road story, then quietly asks what kind of home Rowan hopes survives.',
        mara:'Mara sings a low temple hymn and talks about healing a kingdom that keeps choosing war.'
      };
      ui.campStatus.textContent=`Bond +${gain}. ${c.name} is now ${bondRank()}.`;
      addLog(`${lines[state.companion]||'The party shares stories beside the fire.'} Bond ${state.companionBond}.`,true);
      chord([294,392,494,659]);renderCamp();updateHud();saveGame(true);return;
    }
    if(state.campedAt===state.location)return;
    if(['rest','prepare','scout'].includes(kind)&&state.rations<1){ui.campStatus.textContent='No rations remain. Try foraging or visit an inn.';beep(90);return;}
    if(kind==='rest'){state.rations-=1;const healBonus=1+(runestone().healing||0);const hp=Math.min(Math.ceil(p.maxHp*.42*healBonus),p.maxHp-p.hp),mp=Math.min(Math.ceil(p.maxMp*.42),p.maxMp-p.mp);p.hp+=hp;p.mp+=mp;state.inspiration=Math.min(3,state.inspiration+(c?.role==='Battle Healer'?1:0));ui.campStatus.textContent=`Short rest: +${hp} HP, +${mp} MP${c?.role==='Battle Healer'?' and Mara grants Inspiration':''}.`;addLog(`Camped in ${currentLocation().name}; the party took a short rest.`,true);chord([262,330,392]);}
    if(kind==='prepare'){state.rations-=1;const mp=Math.min(Math.ceil(p.maxMp*.6),p.maxMp-p.mp);p.mp+=mp;state.preparedMagic=true;ui.campStatus.textContent=`Preparation complete: +${mp} MP. Your next job skill deals 18% more damage or healing.`;addLog('The party studies spells, maps, and enemy habits by firelight.',true);chord([330,440,554]);}
    if(kind==='scout'){state.rations-=1;state.roadAdvantage=true;state.inspiration=Math.min(3,state.inspiration+1);ui.campStatus.textContent='Scouting complete: advantage on the next road check and +1 Inspiration.';addLog(`${c?.name||'The party'} scouts the road ahead.`,true);chord([392,523,659]);}
    if(kind==='forage'){state.checksAttempted+=1;const mod=abilityMod('wis')+companionCheckBonus('wis')+relicCheckBonus('wis'),roll=rollD20(false),total=roll+mod,dc=12;state.choicesMade+=1;if(roll===20||(roll!==1&&total>=dc)){state.checksSucceeded+=1;state.rations+=2;ui.campStatus.textContent=`Forage ${roll} ${mod>=0?'+':''}${mod} = ${total}: success. Found 2 rations.`;addLog('The party finds edible roots, dry wood, and two days of rations.',true);chord([440,554,660]);}else{const harm=Math.max(1,Math.floor(p.maxHp*.05));p.hp=Math.max(1,p.hp-harm);ui.campStatus.textContent=`Forage ${roll} ${mod>=0?'+':''}${mod} = ${total}: failed. Lost ${harm} HP to thorns and bad footing.`;beep(92,.14,'square',.04);}}
    state.campedAt=state.location;renderCamp();updateHud();saveGame(true);
  }


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
  function talkInnkeeper(){const p=state.player;if(p.hp===p.maxHp&&p.mp===p.maxMp){queueDialogue('Innkeeper Hobb',['You look painfully healthy. Come back after a cavern or two.']);return;}if(p.gold<20){queueDialogue('Innkeeper Hobb',['A bed and hot soup cost 20 gold. The stove is free if you stand nearby and look tragic.']);return;}if(confirm('Rest at the Frost Lantern Inn for 20 gold?')){p.gold-=20;p.hp=p.maxHp;p.mp=p.maxMp;state.rations=Math.min(9,state.rations+2);state.campedAt='';queueDialogue('Innkeeper Hobb',['Fresh blankets, hot soup, two packed rations, and no haunted armor before breakfast.']);chord([392,523,659]);}}
  function talkArena(){if(state.questStage<14){queueDialogue('Arena Master Kesh',['The arena opens only to heroes recognized by Queen Maela.']);return;}if(state.inBattle)return;if(confirm('Fight a scaling arena champion? You keep the gold and EXP if you win.')){startBattle({id:`arena-${Date.now()}`,type:'arenaChampion',repeatable:true});}}

  function talkSideQuest(id,speaker){const q=SIDE_QUESTS[id],sq=state.sideQuests[id];if(!q||!sq)return;const progress=Math.min(q.goal,cValue(q.counter));if(sq.status==='available'){sq.status='active';addLog(`Guild quest accepted: ${q.name}.`,true);queueDialogue(speaker,[q.desc,'Return when the work is complete. Progress already made will count.']);}
    else if(sq.status==='active'&&progress>=q.goal){sq.status='claimed';grantReward(q.reward,`${q.name} reward`);queueDialogue(speaker,['Excellent work. The guild has recorded the contract as complete.']);chord([523,659,784]);}
    else if(sq.status==='active')queueDialogue(speaker,[`${q.name}: ${progress} of ${q.goal} complete.`]);else queueDialogue(speaker,['This contract is complete. The guild remembers reliable adventurers.']);updateHud();saveGame(true);}

  function openChest(chestId){const chest=currentLocation().chests.find(c=>c.id===chestId);if(!chest)return;if(chest.opened){queueDialogue('Opened Chest',['Only dust and a few heroic fingerprints remain.']);return;}chest.opened=true;grantReward(chest.reward||{},'Treasure found',false);addLog(chest.text,true);queueDialogue('Treasure Chest',[chest.text]);chord([659,784,988]);updateHud();saveGame(true);}
  function grantReward(reward,label='Reward',log=true){const p=state.player;if(reward.gold){p.gold+=reward.gold;state.totalGoldEarned+=reward.gold;}if(reward.potions)p.potions+=reward.potions;if(reward.bombs)p.bombs+=reward.bombs;if(reward.defense)p.defense+=reward.defense;if(reward.exp)gainExp(reward.exp);if(log){const parts=[];if(reward.gold)parts.push(`${reward.gold} gold`);if(reward.potions)parts.push(`${reward.potions} potion${reward.potions===1?'':'s'}`);if(reward.bombs)parts.push(`${reward.bombs} bomb${reward.bombs===1?'':'s'}`);if(reward.exp)parts.push(`${reward.exp} EXP`);addLog(`${label}: ${parts.join(', ')}.`,true);}updateHud();}

  const CLASS_FEATURES = {
    vanguard:{name:'Hold the Line',desc:'At CLOSE range you gain +1 on weapon attack rolls. Your Iron Riposte reaction reduces a hit and counters.'},
    arcanist:{name:'Arcane Thesis',desc:'Damaging skills deal 8% more damage. Runic Ward can greatly reduce one incoming hit and restore MP.'},
    ranger:{name:'Hunter’s Geometry',desc:'At FAR range you gain +5% critical chance. Slipstep can completely evade an incoming hit.'},
    paladin:{name:'Oathbound Presence',desc:'Below half HP you gain +1 Armor Class. Guardian Oath reduces a hit and restores HP.'},
    rogue:{name:'First Shadow',desc:'Begin every battle with advantage on the first weapon attack. Shadow Feint can evade and grant another advantage.'},
    cleric:{name:'Dawn Benediction',desc:'Radiant attacks exploit spectral foes. Warding Prayer reduces a hit and restores HP.'},
    spellblade:{name:'Spell Weave',desc:'Skills deal 5% more damage. Perfect timed strikes restore an extra MP. Arc Parry can counter with arcane force.'}
  };
  const CLASS_REACTIONS = {
    vanguard:{name:'IRON RIPOSTE',desc:'Reduce the next hit and counterattack.'},
    arcanist:{name:'RUNIC WARD',desc:'Reduce the next hit and recover MP.'},
    ranger:{name:'SLIPSTEP',desc:'Chance to evade the next hit completely.'},
    paladin:{name:'GUARDIAN OATH',desc:'Reduce the next hit and heal.'},
    rogue:{name:'SHADOW FEINT',desc:'High evade chance; success grants advantage.'},
    cleric:{name:'WARDING PRAYER',desc:'Reduce the next hit and heal.'},
    spellblade:{name:'ARC PARRY',desc:'Reduce the next hit and answer with arcane damage.'}
  };
  const RARE_RELIC_POOL=['mooncoin','wardstone','warhorn','runicRing','oathThread','stormDie'];

  const JOB_BURSTS = {
    vanguard: { name:'SEVENFOLD BREAKER', text:'Sevenfold Breaker shatters armor and fills the stagger gauge!' },
    arcanist: { name:'CROWNFALL NOVA', text:'Crownfall Nova calls a burning star into the battlefield!' },
    ranger: { name:'SKYFANG VOLLEY', text:'Skyfang Volley rains five enchanted arrows!' },
    paladin: { name:'DAWN AEGIS', text:'Dawn Aegis strikes, heals, and raises an unbreakable guard!' },
    rogue: { name:'PHANTOM REQUIEM', text:'Phantom Requiem crosses the enemy before its shadow can move!' },
    cleric: { name:'SERAPHIC JUDGMENT', text:'Seraphic Judgment burns corruption and restores sacred life!' },
    spellblade: { name:'ECLIPSE EDGE', text:'Eclipse Edge joins flame and starlight in one impossible cut!' }
  };


  function companionAssistName(){return {brann:'Shield Bash',lyss:'Runic Recall',pip:'Ambush Shot',mara:'Healing Hymn'}[state.companion]||'Party Assist';}
  function useCompanionAssist(){
    if(state.companionCooldown>0)return false;const p=state.player,e=state.battleEnemy,c=state.companion;if(!c)return false;
    const bond=bondMultiplier(),tactic=state.companionTactic||'assault',covenant=sigilIs('covenant'),surge=(state.companionBond||0)>=20&&state.battleMomentum>=70;let damageMult=(tactic==='assault'?1.22:1)*(covenant?1.18:1),supportMult=(tactic==='support'?1.25:1)*(covenant?1.12:1);if(surge){state.battleMomentum-=70;damageMult*=1.48;supportMult*=1.42;spawnFx('burst');spawnFx('word','COVENANT SURGE');ui.battle.classList.add('covenant-cinematic');setTimeout(()=>ui.battle.classList.remove('covenant-cinematic'),850);shakeBattle(8);}const fast=surge||hasTalent('kindledOath')||bondRank()==='OATHBOUND'||tactic==='support'||covenant;state.companionCooldown=fast?2:3;advanceCombo('companion',surge?28:14);
    if(c==='brann'){applyEnemyDamage((effectiveAttack()*.78+8)*bond*damageMult,'Brann crashes his shield into the foe for {damage} damage!',{skill:true,prepared:false,stagger:Math.floor(42*bond),flash:true,type:'physical'});state.guarding=true;}
    if(c==='lyss'){const d=(18+p.level*4+equippedWeapon().power)*bond*damageMult;applyEnemyDamage(d,'Lyss breaks a rune for {damage} arcane damage!',{skill:true,prepared:false,stagger:18,flash:true,type:'arcane'});p.mp=Math.min(p.maxMp,p.mp+Math.floor(6*bond*supportMult));}
    if(c==='pip'){const d=(effectiveAttack()*1.18+randomBetween(5,12))*bond*damageMult;applyEnemyDamage(d,'Pip appears from the flank for {damage} damage!',{skill:true,prepared:false,stagger:24,flash:true,type:'physical'});state.advantageNext=true;}
    if(c==='mara'){const healing=(1+(runestone().healing||0))*supportMult;const heal=Math.min(Math.ceil((p.maxHp*.34+p.level*2)*bond*healing),p.maxHp-p.hp);p.hp+=heal;spawnFx('heal',`+${heal}`,'hero');ui.battleLog.textContent=`Mara's Healing Hymn restores ${heal} HP. ${bondRank()} trust steadies the party.`;state.guarding=true;}
    if(tactic==='guardian')gainBarrier(p.maxHp*(surge?.28:.16),surge?'COVENANT WARD':'PARTY WARD');if(surge){state.advantageNext=true;p.stamina=Math.min(p.maxStamina,p.stamina+18);}
    spawnFx('word',`${surge?'COVENANT SURGE · ':''}${companionAssistName().toUpperCase()} · ${partyTactic().name}`);chord([330,440,660]);updateBattleUi();
    if(e.hp<=0){state.battleLocked=true;setBattleButtons(true);setTimeout(victory,430);}
    return true;
  }
  function cyclePartyTactic(){if(!state.companion)return false;const order=['assault','guardian','support'];state.companionTactic=order[(order.indexOf(state.companionTactic)+1)%order.length];ui.battleLog.textContent=`Party doctrine changed to ${partyTactic().name}. ${partyTactic().desc}`;spawnFx('word',`PARTY · ${partyTactic().name}`);updateBattleUi();return true;}

  function setBattleTheme(){
    [...ui.battle.classList].filter(name=>name.startsWith('biome-')).forEach(name=>ui.battle.classList.remove(name));
    ui.battle.classList.add(`biome-${currentLocation().biome}`);
    const colors=currentJob().colors;ui.battleHero.style.setProperty('--hero-hair',colors[0]);ui.battleHero.style.setProperty('--hero-skin',colors[1]);ui.battleHero.style.setProperty('--hero-cloth',colors[2]);ui.battleHero.style.setProperty('--hero-accent',colors[3]);
  }

  function startBattle(enemy){
    const base=ENEMY_TYPES[enemy.type];if(!base)return;
    state.inBattle=true;state.battleLocked=false;state.guarding=false;state.activeEnemyId=enemy.id;
    state.battleCombo=0;state.battleMaxCombo=0;state.battleMomentum=0;state.battleLastAction='';state.battleFlow=0;state.battleFlowReady=false;state.battleLastDamageType='';state.battleReactionCount=0;state.battlePerfects=0;state.battleDamageTaken=0;state.battleTurns=0;state.timingActive=false;state.battleStance='balanced';state.battleRange='mid';state.battleCompanionUsed=false;state.companionCooldown=0;state.reactionUsed=false;state.reactionReadied=false;state.parryPrimed=false;state.parryCooldown=0;state.battleRound=1;state.battlePhase=1;state.disadvantageNext=false;state.advantageNext=state.player.job==='rogue';state.player.stamina=state.player.maxStamina||100;state.player.barrier=0;state.environmentUsed=false;state.dodgePrimed=false;state.weaponTechniqueCooldown=0;state.battleSurface=null;state.battleTacticalReads=0;state.battleReadRound=0;state.battleEnvironment=BATTLE_ENVIRONMENTS[currentLocation().biome]||BATTLE_ENVIRONMENTS.grass;
    const diff=difficultyData(),arenaScale=enemy.repeatable?Math.max(0,state.player.level-5):0,rawAttack=base.attack+arenaScale*2,hunt=state.huntStreak||0,huntEnemy=1+Math.min(.22,hunt*.024),huntAttack=1+Math.min(.16,hunt*.017),huntReward=huntRewardMult();
    const hp=Math.ceil((base.hp+arenaScale*18)*diff.enemyHp*huntEnemy);
    state.battleEnemy={id:enemy.id,type:enemy.type,name:base.name,hp,maxHp:hp,attack:Math.ceil(rawAttack*diff.enemyAttack*huntAttack),exp:Math.floor((base.exp+arenaScale*6)*diff.reward*huntReward),gold:[Math.floor((base.gold[0]+arenaScale*3)*diff.reward*huntReward),Math.floor((base.gold[1]+arenaScale*4)*diff.reward*huntReward)],boss:!!base.boss,sprite:base.sprite,repeatable:!!enemy.repeatable,dotTurns:0,dotDamage:0,dotName:'',stunned:false,broken:false,stagger:0,ward:0,intent:null,nextIntent:null,armor:10+Math.floor(rawAttack/5)+(base.boss?2:0)+diff.enemyArmor,initiative:Math.floor(rawAttack/6)+(base.boss?1:0),phase:1,elite:null,elite2:null};
    if(!base.boss&&state.questStage>=6){
      const eliteChance=Math.min(.88,diff.eliteChance+state.questStage*.007+(state.huntStreak||0)*.012);
      if(Math.random()<eliteChance){
        const ids=Object.keys(ELITE_TRAITS),first=ids[randomBetween(0,ids.length-1)];
        state.battleEnemy.elite=first;
        if(state.questStage>=14&&Math.random()<diff.nemesisChance){
          const secondPool=ids.filter(id=>id!==first);state.battleEnemy.elite2=secondPool[randomBetween(0,secondPool.length-1)];
        }
        enemyTraits(state.battleEnemy).forEach(trait=>{
          if(trait.attackMult)state.battleEnemy.attack=Math.ceil(state.battleEnemy.attack*trait.attackMult);
          if(trait.armor)state.battleEnemy.armor+=trait.armor;
          if(trait.initiative)state.battleEnemy.initiative+=trait.initiative;
          if(trait.hex)state.disadvantageNext=true;
        });
        const names=enemyTraitIds(state.battleEnemy).map(id=>ELITE_TRAITS[id].name);
        state.battleEnemy.name=`${state.battleEnemy.elite2?'NEMESIS · ':''}${names.join(' · ')} ${base.name}`;
        const eliteReward=state.battleEnemy.elite2?1.58:1.30;
        state.battleEnemy.exp=Math.floor(state.battleEnemy.exp*eliteReward);
        state.battleEnemy.gold=state.battleEnemy.gold.map(v=>Math.floor(v*eliteReward));
      }
    }
    window.dispatchEvent(new CustomEvent('emberfall:battlestart',{detail:{enemy:state.battleEnemy.name,boss:state.battleEnemy.boss}}));
    setBattleTheme();ui.battle.classList.remove('phase-1','phase-2','phase-3','nemesis-battle');ui.battle.classList.add('phase-1');if(state.battleEnemy.elite2)ui.battle.classList.add('nemesis-battle');chooseEnemyIntent();ui.battle.classList.remove('hidden');ui.timingPanel.classList.add('hidden');
    const heroRoll=rollD20(),heroInit=heroRoll+abilityMod('dex'),enemyRoll=rollD20(),enemyInit=enemyRoll+state.battleEnemy.initiative,c=companion(),compRoll=rollD20(),compMod=state.companion==='pip'?3:state.companion==='brann'?0:1,compInit=compRoll+compMod;
    state.initiativeOrder=[{id:'hero',label:'ROWAN',roll:heroInit},{id:'companion',label:c?c.name.split(' ')[0].toUpperCase():'ALLY',roll:compInit},{id:'enemy',label:base.name.split(',')[0].toUpperCase(),roll:enemyInit}].sort((a,b)=>b.roll-a.roll);state.battleActiveActor=enemyInit>heroInit?'enemy':'hero';
    showBattleRoll('Initiative',heroRoll,abilityMod('dex'),heroInit);ui.battleLog.textContent=`${base.intro} World Tier ${diff.tier} · ${diff.name}. Hunt Chain x${state.huntStreak||0}. Initiative: you ${heroInit}, ${c?c.name.split(' ')[0]:'ally'} ${compInit}, ${base.name} ${enemyInit}.`;updateBattleUi();setTimeout(()=>spawnFx('word',state.battleEnemy.elite2?'NEMESIS':base.boss?'BOSS BATTLE':state.battleEnemy.elite?'ELITE':'ENGAGE!'),100);chord(base.boss?[164,147,131,98]:state.battleEnemy.elite2?[174,130,98,73]:[196,185,174]);
    if(enemyInit>heroInit){state.battleLocked=true;setBattleButtons(true);ui.battleLog.textContent+=` ${base.name} moves first!`;setTimeout(enemyTurn,820);}else{state.battleLocked=false;setBattleButtons(false);ui.battleLog.textContent+=' You move first.';}
  }


  function setBattleButtons(disabled){
    const p=state.player,job=state.player.job?currentJob():null;
    document.querySelectorAll('[data-action]').forEach(button=>{
      const action=button.dataset.action;
      const skill1Locked=action==='skill1'&&(!job||p.mp<job.skills[0].cost);
      const skill2Locked=action==='skill2'&&(!job||p.mp<job.skills[1].cost||(p.job==='cleric'&&p.hp>=p.maxHp));
      const burstLocked=action==='burst'&&state.battleMomentum<100;
      const dodgeLocked=action==='dodge'&&(p.stamina||0)<dodgeCost();
      const parryLocked=action==='parry'&&((p.stamina||0)<parryCost()||state.parryCooldown>0||state.parryPrimed);
      const executeLocked=action==='execute'&&!executeReady();
      const techniqueLocked=action==='weaponTechnique'&&((p.stamina||0)<currentTechnique().cost||state.weaponTechniqueCooldown>0);
      const environmentLocked=action==='environment'&&state.environmentUsed;
      const companionLocked=action==='companion'&&(state.companionCooldown>0||!state.companion);
      const reactionLocked=action==='reaction'&&state.reactionUsed;
      const potionLocked=action==='potion'&&(p.potions<1||p.hp>=p.maxHp);
      const bombLocked=action==='bomb'&&p.bombs<1;
      const inspireLocked=action==='inspire'&&state.inspiration<1;
      const locked=disabled||skill1Locked||skill2Locked||burstLocked||dodgeLocked||parryLocked||executeLocked||techniqueLocked||environmentLocked||companionLocked||reactionLocked||potionLocked||bombLocked||inspireLocked;
      let reason='';
      if(disabled)reason='WAIT FOR TURN';else if(skill1Locked||skill2Locked)reason=(p.job==='cleric'&&action==='skill2'&&p.hp>=p.maxHp)?'HP ALREADY FULL':'NOT ENOUGH MP';else if(potionLocked)reason=p.potions<1?'NO POTIONS':'HP ALREADY FULL';else if(bombLocked)reason='NO BOMBS';else if(inspireLocked)reason='NO INSPIRATION';else if(burstLocked)reason='NEEDS 100 MOMENTUM';else if(dodgeLocked||parryLocked||techniqueLocked)reason='RESOURCE / COOLDOWN';else if(executeLocked)reason='NO EXECUTION OPENING';else if(environmentLocked)reason='ENVIRONMENT SPENT';else if(companionLocked)reason='COMPANION RECHARGING';else if(reactionLocked)reason='REACTION SPENT';
      button.disabled=locked;button.style.opacity=locked?'.55':'1';if(reason)button.title=reason;else button.removeAttribute('title');
    });
    ui.burstBtn.classList.toggle('ready',state.battleMomentum>=100&&!disabled);
    if(ui.executeBtn)ui.executeBtn.classList.toggle('ready',executeReady()&&!disabled);
    if(ui.parryBtn)ui.parryBtn.classList.toggle('ready',state.parryPrimed);
    updateFriendlyUi();
  }

  function intentInfo(intent){
    const map={
      attack:['STRIKE','A direct attack.',''],
      heavy:['CRUSHING BLOW','Heavy damage. Guarding is strongly advised.','danger'],
      drain:['MANA REND','Damage plus MP drain.','danger'],
      mend:['DARK MENDING','The enemy will recover HP.','support'],
      brace:['IRON WARD','The enemy will reduce your next damaging action.','support'],
      sweep:['WIDE SWEEP','A broad attack. FAR range is safer.','danger'],
      hex:['DREAD HEX','Damage plus disadvantage on your next weapon attack.','danger'],
      ultimate:['CROWN CATASTROPHE','A devastating boss technique. Guard or ready a reaction!','danger']
    };
    return map[intent]||map.attack;
  }

  function rollEnemyIntent(enemy){
    const roll=Math.random(),hp=enemy.hp/enemy.maxHp,p=state.player,heroHp=p.hp/p.maxHp,range=state.battleRange,archetype=String(enemy.sprite||'').split(' ')[0];
    // Shared reactive rules: wounded enemies, boss pressure, and player defenses matter first.
    if(hp<.27&&roll<.18)return'mend';
    if(enemy.boss&&enemy.phase>=2&&state.battleMomentum>=70&&roll<.46)return'ultimate';
    if(enemy.boss&&heroHp<.35&&roll<.40)return'ultimate';
    if((p.barrier||0)>0&&roll<.22)return'drain';
    if(state.guarding&&roll<.25)return'hex';
    if(state.parryPrimed&&roll<.24)return'brace';
    // Archetype profiles keep enemy families from feeling like the same random table.
    if(['mage','wraith'].includes(archetype)){if(range==='close'&&roll<.28)return'brace';if(roll<.50)return'hex';if(roll<.68)return'drain';if(roll<.80)return'heavy';return'attack';}
    if(['golem','knight','guard'].includes(archetype)){if(roll<.24)return'brace';if(roll<.58)return'heavy';if(range==='close'&&roll<.75)return'sweep';return'attack';}
    if(archetype==='bird'){if(range==='close'&&roll<.44)return'sweep';if(roll<.62)return'heavy';if(roll<.72)return'brace';return'attack';}
    if(['beast','wolf','rat','slime'].includes(archetype)){if(range==='close'&&roll<.48)return'sweep';if(roll<.68)return'heavy';if(heroHp<.35&&roll<.78)return'attack';return roll<.84?'hex':'attack';}
    if(range==='close'&&roll<.35)return'sweep';if(range==='far'&&roll<.30)return'heavy';if(heroHp<.32&&roll<.34)return'heavy';if(enemy.boss&&roll<.24)return'ultimate';if(roll<.40)return'heavy';if(roll<.54)return'sweep';if(roll<.65)return'hex';if(roll<.75)return'drain';if(roll<.84)return'brace';return'attack';
  }
  function chooseEnemyIntent(){
    const enemy=state.battleEnemy;if(!enemy)return;const previous=enemy.intent;let current=enemy.nextIntent||rollEnemyIntent(enemy);
    // Protect the recovery window even when an Ultimate/Mend was already queued before a forced phase action.
    if(previous==='ultimate'&&current==='ultimate')current='brace';
    if(previous==='mend'&&current==='mend')current='attack';
    enemy.intent=current;let next=rollEnemyIntent(enemy);
    if(enemy.intent==='ultimate'&&next==='ultimate')next=enemy.hp/enemy.maxHp<.40?'brace':'attack';
    if(enemy.intent==='mend'&&next==='mend')next='attack';
    enemy.nextIntent=next;
  }

  function updateBattleUi(){
    const enemy=state.battleEnemy;if(!enemy)return;
    ui.enemyName.textContent=enemy.name.toUpperCase();ui.battle.classList.toggle('elite-battle',!!enemy.elite);ui.battle.classList.toggle('nemesis-battle',!!enemy.elite2);ui.enemyHpText.textContent=`${Math.max(0,enemy.hp)} / ${enemy.maxHp} HP`;
    ui.enemyHpBar.style.width=`${Math.max(0,enemy.hp/enemy.maxHp*100)}%`;const transient=[...ui.enemySprite.classList].filter(name=>['hit-anim','attack-anim','skill-anim'].includes(name));ui.enemySprite.className=`enemy-sprite ${enemy.sprite}${enemy.stunned?' staggered':''}`;transient.forEach(name=>ui.enemySprite.classList.add(name));
    const statuses=[];if(enemy.dotTurns>0)statuses.push(`${enemy.dotName.toUpperCase()} · ${enemy.dotTurns} TURNS`);if(enemy.ward>0)statuses.push('IRON WARD');if(enemy.stunned)statuses.push('STAGGERED');if(enemy.broken)statuses.push('BROKEN · +25% DMG');if(enemy.phase>1)statuses.push(`PHASE ${enemy.phase}`);if(enemy.elite)statuses.push(ELITE_TRAITS[enemy.elite].name);if(enemy.elite2)statuses.push(ELITE_TRAITS[enemy.elite2].name);if(state.battleSurface)statuses.push(BATTLE_SURFACES[state.battleSurface.type].name);
    ui.enemyStatus.textContent=statuses.join(' · ');ui.staggerBar.style.width=`${Math.min(100,enemy.stagger||0)}%`;
    const intent=intentInfo(enemy.intent),nextIntent=intentInfo(enemy.nextIntent);ui.enemyIntent.innerHTML=`<strong>INTENT: ${intent[0]}</strong><br>${intent[1]}`;ui.enemyIntent.className=`enemy-intent ${intent[2]}`;if(ui.intentTimeline)ui.intentTimeline.innerHTML=`<span class="intent-now ${intent[2]}"><small>NOW</small><strong>${intent[0]}</strong></span><i>→</i><span class="intent-next ${nextIntent[2]}"><small>NEXT</small><strong>${nextIntent[0]}</strong></span>`;
    ui.comboText.textContent=`x${state.battleCombo}`;ui.momentumText.textContent=`${Math.floor(state.battleMomentum)}%`;ui.momentumBar.style.width=`${Math.min(100,state.battleMomentum)}%`;
    const p=state.player;if(ui.environmentCard){const env=state.battleEnvironment||BATTLE_ENVIRONMENTS.grass;ui.environmentCard.innerHTML=`<small>BATTLEFIELD ${state.environmentUsed?'· SPENT':''}</small><strong>${escapeHtml(env.name)}</strong><span>${escapeHtml(env.desc)}</span>`;ui.environmentCard.classList.toggle('spent',state.environmentUsed);}if(ui.environmentBtn)ui.environmentBtn.textContent=state.environmentUsed?'ENVIRONMENT · SPENT':'USE ENVIRONMENT';if(ui.dodgeBtn)ui.dodgeBtn.textContent=`DODGE · ${dodgeCost()} STA`;if(ui.parryBtn)ui.parryBtn.textContent=state.parryPrimed?'PARRY · READY':state.parryCooldown?`PARRY · ${state.parryCooldown}`:`PARRY · ${parryCost()} STA`;if(ui.executeBtn)ui.executeBtn.textContent=`EXECUTION · ${executionCost()} MOM`;if(ui.weaponTechniqueBtn){const tech=currentTechnique();ui.weaponTechniqueBtn.textContent=state.weaponTechniqueCooldown?`${tech.name.toUpperCase()} · ${state.weaponTechniqueCooldown}`:`${tech.name.toUpperCase()} · ${tech.cost} STA`;}if(ui.eliteBadge){const traits=enemyTraits(enemy);ui.eliteBadge.classList.toggle('hidden',!traits.length);ui.eliteBadge.textContent=traits.length?`${enemy.elite2?'NEMESIS':'ELITE'} · ${traits.map(t=>t.name).join(' + ')} · ${traits.map(t=>t.desc).join(' ')}`:'';}if(ui.surfaceChip){const surf=state.battleSurface?BATTLE_SURFACES[state.battleSurface.type]:null;ui.surfaceChip.className=`surface-chip ${surf?surf.className:'dormant'}`;ui.surfaceChip.innerHTML=surf?`<small>SURFACE · ${state.battleSurface.turns} ROUNDS</small><strong>${surf.name}</strong><span>${surf.desc}</span>`:`<small>SURFACE</small><strong>STABLE GROUND</strong><span>No persistent field effect.</span>`;}if(ui.staminaText)ui.staminaText.textContent=`${Math.floor(p.stamina||0)} / ${p.maxStamina||100}`;if(ui.staminaBar)ui.staminaBar.style.width=`${Math.max(0,(p.stamina||0)/(p.maxStamina||100)*100)}%`;if(ui.barrierText)ui.barrierText.textContent=`${Math.floor(p.barrier||0)} / ${maxBarrier()}`;if(ui.barrierBar)ui.barrierBar.style.width=`${Math.max(0,(p.barrier||0)/maxBarrier()*100)}%`;const hero=[];if(state.battleFlowReady)hero.push('FLOW SURGE READY');else if((state.battleFlow||0)>0)hero.push(`FLOW ${Math.floor(state.battleFlow)}%`);if(state.guarding)hero.push('GUARD');if(p.attackBuffTurns>0)hero.push(`POWER ${p.attackBuffTurns}`);if(p.evasionTurns>0)hero.push(`EVADE ${p.evasionTurns}`);if(state.parryPrimed)hero.push('PARRY READY');if((p.barrier||0)>0)hero.push(`WARD ${Math.floor(p.barrier)}`);ui.heroStatus.textContent=hero.join(' · ');
    ui.burstBtn.textContent=state.player.job?JOB_BURSTS[state.player.job].name:'ROADBURST';if(ui.armorClassText)ui.armorClassText.textContent=heroAC();if(ui.stanceText)ui.stanceText.textContent=`STANCE · ${state.battleStance.toUpperCase()}`;if(ui.companionBattleChip){const c=companion();ui.companionBattleChip.textContent=c?`${c.name.toUpperCase()} · ${c.role.toUpperCase()} · BOND ${state.companionBond||0} ${bondRank()} · ${state.companionCooldown?`COMMAND IN ${state.companionCooldown}`:'COMMAND READY'}`:'SOLO ADVENTURER';}if(ui.inspireBtn)ui.inspireBtn.textContent=`INSPIRATION ${state.inspiration}`;if(ui.companionAssistBtn)ui.companionAssistBtn.textContent=state.companionCooldown?`COMPANION · ${state.companionCooldown}`:((state.companionBond||0)>=20&&state.battleMomentum>=70?`COVENANT SURGE · ${companionAssistName().toUpperCase()}`:`COMPANION · ${companionAssistName().toUpperCase()}`);if(ui.partyTacticBtn)ui.partyTacticBtn.textContent=`PARTY · ${partyTactic().name}`;if(ui.reactionBtn)ui.reactionBtn.textContent=state.reactionReadied?`${classReaction().name} · READY`:state.reactionUsed?'REACTION · SPENT':`REACTION · ${classReaction().name}`;if(ui.positionBtn)ui.positionBtn.textContent=`POSITION · ${state.battleRange.toUpperCase()}`;if(ui.initiativeTrack)ui.initiativeTrack.innerHTML=initiativeHtml();if(ui.battlePhaseText)ui.battlePhaseText.textContent=`ROUND ${state.battleRound} · PHASE ${enemy.phase}`;if(ui.enemyAffinityText)ui.enemyAffinityText.textContent=affinityLabel(enemy);if(ui.difficultyBattleText)ui.difficultyBattleText.textContent=`TIER ${difficultyData().tier} · ${difficultyData().name}`;setBattleButtons(state.battleLocked&&!state.timingActive);updateFriendlyUi();updateHud();
  }

  function effectiveAttack(){let base=(totalAttack()+state.player.level*2)*stanceDamageMultiplier()*rangeDamageMultiplier()*(1+(equippedRelic()?.damage||0)+affixBonus('damage')+(hasTalent('ruthlessEdge')?.08:0));if(hasTalent('executioner')&&state.battleEnemy&&state.battleEnemy.hp/state.battleEnemy.maxHp<.35)base*=1.16;base=state.player.attackBuffTurns>0?base*1.28:base;return Math.floor(base);}
  function spendMp(cost){if(state.player.mp<cost){ui.battleLog.textContent=`Not enough MP. Need ${cost}.`;beep(90);return false;}state.player.mp-=cost;if(state.companion==='lyss'&&Math.random()<.22){state.player.mp=Math.min(state.player.maxMp,state.player.mp+1);showToast('LYSS RECOVERS 1 MP');}return true;}

  function animateClass(element,className,duration=460){element.classList.remove(className);void element.offsetWidth;element.classList.add(className);setTimeout(()=>element.classList.remove(className),duration);}
  function flashBattle(red=false){ui.battleFlash.className=`battle-flash${red?' red':''}`;void ui.battleFlash.offsetWidth;ui.battleFlash.classList.add('flash');setTimeout(()=>ui.battleFlash.className='battle-flash',320);}
  function spawnFx(kind,text='',target='enemy'){
    window.dispatchEvent(new CustomEvent('emberfall:fx',{detail:{kind,text,target}}));
    const fx=document.createElement('span');
    if(kind==='slash')fx.className='fx-slash';else if(kind==='burst')fx.className='fx-burst';else if(kind==='word'){fx.className='fx-word';fx.textContent=text;}else{fx.className=`fx-number${kind==='heal'?' heal':''}${target==='hero'&&kind!=='heal'?' hero-damage':''}`;fx.textContent=text;fx.style.left=target==='hero'?'22%':'72%';fx.style.top=target==='hero'?'37%':'29%';}
    ui.battleFx.appendChild(fx);setTimeout(()=>fx.remove(),950);
  }

  function advanceCombo(action,bonus=0){
    const varied=state.battleLastAction&&state.battleLastAction!==action;
    state.battleCombo=varied?Math.min(9,state.battleCombo+1):Math.max(1,state.battleCombo-(state.battleLastAction===action?1:0));
    state.battleLastAction=action;state.battleMaxCombo=Math.max(state.battleMaxCombo,state.battleCombo);state.battleMomentum=Math.min(100,state.battleMomentum+8+state.battleCombo*2+bonus+(equippedRelic()?.momentum||0)+affixBonus('momentum')+(hasTalent('tactician')&&varied?8:0));
    const flowGain=(varied?14+Math.min(10,state.battleCombo*2):4)+(bonus>=15?4:0);
    state.battleFlow=Math.min(100,(state.battleFlow||0)+flowGain);
    if(state.battleFlow>=100&&!state.battleFlowReady){state.battleFlowReady=true;spawnFx('word','FLOW SURGE READY');showToast('FLOW SURGE READY');}
  }

  function applyEnemyDamage(amount,text,options={}){
    const enemy=state.battleEnemy,wasBroken=!!enemy.broken,previousType=state.battleLastDamageType||'',flowSurge=!!state.battleFlowReady;if(options.skill&&options.prepared!==false&&state.preparedMagic){amount*=1.18;state.preparedMagic=false;showToast('PREPARED BONUS');}if(options.skill){if(state.player.job==='arcanist')amount*=1.08;if(state.player.job==='spellblade')amount*=1.05;amount*=1+(equippedRelic()?.spellPower||0)+affixBonus('skill')+(hasTalent('spellEcho')?.10:0);}const damageType=options.type||'physical';let reaction='';
    if(previousType&&previousType!==damageType){const pair=[previousType,damageType].sort().join('+');if(pair==='fire+poison'){amount*=1.20;reaction='COMBUSTION';options.stagger=(options.stagger||8)+18;}else if(pair==='arcane+radiant'){amount*=1.18;reaction='VEILFLARE';options.stagger=(options.stagger||8)+14;}else if(pair==='frost+physical'){amount*=1.15;reaction='SHATTER';options.stagger=(options.stagger||8)+25;}else{amount*=1.08;reaction='CHAIN REACTION';options.stagger=(options.stagger||8)+8;}state.battleReactionCount=(state.battleReactionCount||0)+1;state.battleMomentum=Math.min(100,state.battleMomentum+8);}
    if(flowSurge){amount*=1.25;options.stagger=(options.stagger||8)+15;state.battleFlow=0;state.battleFlowReady=false;text=`FLOW SURGE! ${text}`;spawnFx('word','FLOW SURGE');}
    state.battleLastDamageType=damageType;const affinity=affinityMultiplier(enemy,damageType);amount*=affinity*(1+runeDamageBonus(damageType));if(sigilIs('catalyst')&&['fire','arcane','radiant','poison'].includes(damageType))amount*=1.12;if(sigilIs('reaver')&&enemy.hp/enemy.maxHp<.35)amount*=1.15;if(wasBroken)amount*=sigilIs('rupture')?1.38:1.25;if(hasTalent('bloodRush')&&state.player.hp<=state.player.maxHp*.5)amount*=1.12;let damage=Math.max(1,Math.floor(amount));
    const chainBonus=1+Math.min(.24,state.battleCombo*.03);damage=Math.floor(damage*chainBonus);if(reaction){text=`${reaction}! ${text}`;spawnFx('word',reaction);}
    if(enemy.ward>0){damage=Math.max(1,Math.floor(damage*(1-enemy.ward)));enemy.ward=0;text=`Iron Ward softens the hit. ${text}`;}
    enemy.hp-=damage;if(wasBroken){enemy.broken=false;text=`BROKEN! ${text}`;}if(affixBonus('leech')>0&&state.player.hp>0){const leeched=Math.min(Math.max(1,Math.floor(damage*affixBonus('leech'))),state.player.maxHp-state.player.hp);if(leeched>0){state.player.hp+=leeched;spawnFx('heal',`+${leeched}`,'hero');}}enemy.stagger=Math.min(100,(enemy.stagger||0)+(options.stagger||8)+affixBonus('stagger')+(sigilIs('rupture')&&damageType==='physical'?12:0)+Math.floor(damage/enemy.maxHp*32));
    const interruptible=['mend','heavy','hex','ultimate'].includes(enemy.intent),interruptNeed=enemy.intent==='ultimate'?60:enemy.intent==='heavy'?42:enemy.intent==='hex'?34:24;
    if(interruptible&&enemy.hp>0&&(options.stagger||0)>=interruptNeed&&enemy.stagger>=60){state.battleMomentum=Math.min(100,state.battleMomentum+14);text=`INTERRUPTED! ${text}`;spawnFx('word','INTERRUPT');enemy.intent='attack';enemy.nextIntent=rollEnemyIntent(enemy);}
    if(affinity>1){text=`WEAKNESS! ${text}`;spawnFx('word',`${damageType.toUpperCase()} WEAKNESS`);}else if(affinity<1){text=`RESISTED. ${text}`;spawnFx('word',`${damageType.toUpperCase()} RESIST`);}
    ui.battleLog.textContent=text.replace('{damage}',damage);animateClass(ui.enemySprite,'hit-anim');animateClass(ui.battleHero,options.skill?'skill-anim':'attack-anim');spawnFx('number',`-${damage}`,'enemy');
    if(options.slash!==false)spawnFx('slash');if(options.flash)flashBattle();
    if(enemy.stagger>=100&&enemy.hp>0){enemy.stagger=0;enemy.stunned=true;enemy.broken=true;state.battleMomentum=Math.min(100,state.battleMomentum+15);setTimeout(()=>spawnFx('word','BREAK!'),120);ui.battleLog.textContent+=` ${enemy.name} is BROKEN — the next hit deals increased damage!`;chord([196,147,98]);}
    if(options.skill&&!options.echo&&sigilIs('echo')&&enemy.hp>0&&Math.random()<.20){const echoDamage=Math.max(1,Math.floor(damage*.45));enemy.hp-=echoDamage;spawnFx('number',`-${echoDamage}`,'enemy');spawnFx('word','SKILL ECHO');ui.battleLog.textContent+=` Echo Sigil repeats ${echoDamage} damage.`;checkBossPhase(enemy);}
    checkBossPhase(enemy);return damage;
  }

  function damageEnemy(amount,text,type='physical'){return applyEnemyDamage(amount,text,{skill:true,stagger:12,flash:true,type});}
  // For damage that isn't a direct player action (surface ticks, DOTs, class-reaction counters):
  // applies the same affinity/ward mitigation and boss-phase check as applyEnemyDamage without
  // the player-action-only side effects (combo chain, hero attack animation, echo sigil, etc.)
  // that don't make sense for passive/environmental damage. Pass text='' to let the caller
  // compose its own log line with the returned (post-mitigation) damage.
  function applyPassiveDamage(amount,text,type='physical',stagger=0){
    const enemy=state.battleEnemy;if(!enemy)return 0;
    const affinity=affinityMultiplier(enemy,type);
    let damage=Math.max(1,Math.floor(amount*affinity*(1+runeDamageBonus(type))));
    if(enemy.ward>0){damage=Math.max(1,Math.floor(damage*(1-enemy.ward)));enemy.ward=0;text=text?`Iron Ward softens the blow. ${text}`:text;}
    enemy.hp-=damage;
    if(stagger)enemy.stagger=Math.min(100,(enemy.stagger||0)+stagger);
    if(text){if(affinity>1)text=`WEAKNESS! ${text}`;else if(affinity<1)text=`RESISTED. ${text}`;ui.battleLog.textContent=text.replace('{damage}',damage);}
    spawnFx('number',`-${damage}`,'enemy');
    checkBossPhase(enemy);
    return damage;
  }

  function useJobSkill(slot){const p=state.player,enemy=state.battleEnemy,jobId=p.job,skill=currentJob().skills[slot-1];if(jobId==='cleric'&&slot===2&&p.hp>=p.maxHp){ui.battleLog.textContent='Your HP is already full.';beep(90);return false;}if(!spendMp(skill.cost))return false;const atk=effectiveAttack();let damage=0;
    if(jobId==='vanguard'&&slot===1){damage=applyEnemyDamage(atk*1.65+randomBetween(2,7),'Power Strike crashes for {damage} damage!',{skill:true,stagger:24,flash:true,type:'physical'});}
    if(jobId==='vanguard'&&slot===2){damage=damageEnemy(atk*1.05+randomBetween(3,8),'War Cry hits for {damage}; your Attack rises!','physical');p.attackBuffTurns=3;}
    if(jobId==='arcanist'&&slot===1){damage=damageEnemy(15+p.level*4+equippedWeapon().power*1.2+randomBetween(2,8),'Arc Bolt deals {damage} magic damage!','arcane');}
    if(jobId==='arcanist'&&slot===2){damage=applyEnemyDamage(29+p.level*6+equippedWeapon().power*1.5+randomBetween(4,12),'Starfall erupts for {damage} damage and ignites the enemy!',{skill:true,stagger:18,flash:true,type:'fire'});enemy.dotTurns=3;enemy.dotDamage=7+p.level;enemy.dotName='burn';createBattleSurface('fire',3);}
    if(jobId==='ranger'&&slot===1){const hit1=Math.max(1,Math.floor(atk*.72)+randomBetween(1,5)),hit2=Math.max(1,Math.floor(atk*.72)+randomBetween(1,5));damage=applyEnemyDamage(hit1+hit2,'Twin Shot lands twice for {damage} total damage!',{skill:true,stagger:16,type:'physical'});}
    if(jobId==='ranger'&&slot===2){damage=damageEnemy(atk*1.12+randomBetween(2,7),'Venom Arrow deals {damage} damage and poisons the enemy!','poison');enemy.dotTurns=4;enemy.dotDamage=5+Math.floor(p.level*.8);enemy.dotName='poison';createBattleSurface('poison',3);}
    if(jobId==='paladin'&&slot===1){damage=applyEnemyDamage(atk*1.38+p.level*2+randomBetween(2,8),'Radiant Smite pierces for {damage} holy damage!',{skill:true,stagger:20,flash:true,type:'radiant'});}
    if(jobId==='paladin'&&slot===2){let healBase=(Math.floor(p.maxHp*.38)+p.level*2)*(1+(runestone().healing||0));if(state.preparedMagic){healBase=Math.floor(healBase*1.18);state.preparedMagic=false;showToast('PREPARED BONUS');}const healed=Math.min(healBase,p.maxHp-p.hp);p.hp+=healed;state.guarding=true;ui.battleLog.textContent=`Sanctuary restores ${healed} HP and raises a holy guard.`;spawnFx('heal',`+${healed}`,'hero');animateClass(ui.battleHero,'guard-anim');createBattleSurface('radiant',3);}
    if(jobId==='rogue'&&slot===1){const crit=Math.random()<.48;damage=applyEnemyDamage(atk*(crit?2.25:1.18)+randomBetween(2,8),crit?'Perfect Backstab! {damage} critical damage!':'Backstab deals {damage} damage.',{skill:true,stagger:crit?25:13,flash:crit,type:'physical'});if(crit)spawnFx('word','CRITICAL!');}
    if(jobId==='rogue'&&slot===2){damage=damageEnemy(atk*.95+randomBetween(2,6),'Smoke Veil cuts for {damage}; you fade from sight!','physical');p.evasionTurns=2;}
    if(jobId==='cleric'&&slot===1){damage=damageEnemy(14+p.level*4+equippedWeapon().power+randomBetween(2,7),'Light Spear burns corruption for {damage} damage!','radiant');p.mp=Math.min(p.maxMp,p.mp+3);}
    if(jobId==='cleric'&&slot===2){let healBase=(Math.floor(p.maxHp*.52)+p.level*3)*(1+(runestone().healing||0));if(state.preparedMagic){healBase=Math.floor(healBase*1.18);state.preparedMagic=false;showToast('PREPARED BONUS');}const healed=Math.min(healBase,p.maxHp-p.hp);p.hp+=healed;ui.battleLog.textContent=`Greater Heal restores ${healed} HP.`;spawnFx('heal',`+${healed}`,'hero');animateClass(ui.battleHero,'skill-anim');}
    if(jobId==='spellblade'&&slot===1){damage=damageEnemy(atk*1.18+p.level*3+randomBetween(3,9),'Flame Arc deals {damage} enchanted damage!','fire');enemy.dotTurns=2;enemy.dotDamage=5+p.level;enemy.dotName='burn';createBattleSurface('fire',3);}
    if(jobId==='spellblade'&&slot===2){damage=damageEnemy(atk*1.52+randomBetween(3,9),'Mana Edge strikes for {damage} and returns power!','arcane');p.mp=Math.min(p.maxMp,p.mp+5);}
    if(sigilIs('flow')){p.stamina=Math.min(p.maxStamina,p.stamina+12);state.battleMomentum=Math.min(100,state.battleMomentum+8);spawnFx('word','FLOW +12 STA');}chord([392,523,784]);return true;
  }

  function startTimingAttack(){
    if(state.timingActive)return;state.timingActive=true;state.battleLocked=true;state.timingStartedAt=performance.now();state.timingDuration=900;
    ui.timingPanel.classList.remove('hidden');ui.battleLog.textContent='Watch the moving blade. Strike near the center of the golden zone!';setBattleButtons(true);
    const loop=now=>{if(!state.timingActive)return;const elapsed=now-state.timingStartedAt;const progress=Math.min(1,elapsed/state.timingDuration);const ping=progress<=.5?progress*2:(1-progress)*2;state.timingPosition=ping;ui.timingCursor.style.left=`calc(${Math.max(0,Math.min(1,ping))*100}% - 4px)`;if(elapsed>=state.timingDuration){confirmTimingAttack(true);return;}state.timingFrame=requestAnimationFrame(loop);};
    state.timingFrame=requestAnimationFrame(loop);
  }

  function confirmTimingAttack(auto=false){
    if(!state.timingActive)return;cancelAnimationFrame(state.timingFrame);state.timingActive=false;ui.timingPanel.classList.add('hidden');
    const pos=Number(state.timingPosition||0),distance=Math.abs(pos-.5);let quality='LATE',mult=.82,bonus=4,stagger=7;
    if(!auto&&distance<=.045){quality='PERFECT',mult=1.72,bonus=26,stagger=28;state.battlePerfects+=1;state.player.mp=Math.min(state.player.maxMp,state.player.mp+2+(state.player.job==='spellblade'?1:0));}
    else if(!auto&&distance<=.11){quality='GREAT',mult=1.35,bonus=16,stagger=18;}
    else if(!auto&&distance<=.21){quality='GOOD',mult=1.05,bonus=10,stagger=12;}
    const p=state.player,ability=weaponAbility(),mod=attackBonus(),roll=battleD20(state.advantageNext,state.disadvantageNext),total=roll+mod,target=enemyTargetArmor();state.advantageNext=false;state.disadvantageNext=false;showBattleRoll(`${ability.toUpperCase()} ATTACK`,roll,mod,total);const hit=roll===20||(roll!==1&&total>=target),crit=roll===20||Math.random()<.06+(p.job==='rogue'?.10:0)+(state.companion==='pip'?.06:0)+stanceCritBonus()+(quality==='PERFECT'?.12:0);if(!hit){quality=roll===1?'NATURAL 1':'GLANCING';mult*=.48;}let raw=(effectiveAttack()+randomBetween(1,7))*mult;if(crit)raw*=1.65;
    advanceCombo('attack',bonus);applyEnemyDamage(raw,`${quality}${crit?' CRITICAL':''}! You deal {damage} damage.`,{stagger,flash:quality==='PERFECT'||crit,type:'physical'});if(quality==='PERFECT'){spawnFx('word','PERFECT!');shakeBattle(6);}else if(crit){spawnFx('word','CRITICAL!');shakeBattle(5);}
    beep(quality==='PERFECT'?220:crit?180:130,.09,'sawtooth',.04);finishPlayerTurn();
  }

  function useBurst(){
    if(state.battleMomentum<100)return false;const p=state.player,enemy=state.battleEnemy,atk=effectiveAttack(),burst=JOB_BURSTS[p.job];state.battleMomentum=0;state.battleCombo=Math.min(9,state.battleCombo+2);
    spawnFx('burst');spawnFx('word',burst.name);flashBattle();animateClass(ui.battleHero,'skill-anim',700);chord([196,262,392,523,784]);
    if(p.job==='vanguard'){applyEnemyDamage(atk*2.8+randomBetween(10,22),`${burst.text} {damage} damage!`,{skill:true,stagger:100,flash:true,type:'physical'});}
    if(p.job==='arcanist'){applyEnemyDamage(54+p.level*9+equippedWeapon().power*2,`${burst.text} {damage} damage!`,{skill:true,stagger:35,flash:true,type:'fire'});enemy.dotTurns=4;enemy.dotDamage=10+p.level*2;enemy.dotName='starfire';}
    if(p.job==='ranger'){applyEnemyDamage(atk*2.45+randomBetween(15,28),`${burst.text} {damage} total damage!`,{skill:true,stagger:45,flash:true,type:'poison'});enemy.dotTurns=4;enemy.dotDamage=7+p.level;enemy.dotName='venom';}
    if(p.job==='paladin'){applyEnemyDamage(atk*2.15+p.level*4,`${burst.text} {damage} holy damage!`,{skill:true,stagger:45,flash:true,type:'radiant'});const heal=Math.min(Math.floor(p.maxHp*.42*(1+(runestone().healing||0))),p.maxHp-p.hp);p.hp+=heal;state.guarding=true;spawnFx('heal',`+${heal}`,'hero');}
    if(p.job==='rogue'){applyEnemyDamage(atk*3.2+randomBetween(12,26),`${burst.text} {damage} critical damage!`,{skill:true,stagger:42,flash:true,type:'physical'});p.evasionTurns=3;}
    if(p.job==='cleric'){applyEnemyDamage(46+p.level*8+equippedWeapon().power*2,`${burst.text} {damage} radiant damage!`,{skill:true,stagger:42,flash:true,type:'radiant'});const heal=Math.min(Math.floor(p.maxHp*.6*(1+(runestone().healing||0))),p.maxHp-p.hp);p.hp+=heal;spawnFx('heal',`+${heal}`,'hero');}
    if(p.job==='spellblade'){applyEnemyDamage(atk*2.75+p.level*5,`${burst.text} {damage} eclipse damage!`,{skill:true,stagger:50,flash:true,type:'arcane'});p.mp=p.maxMp;}
    return true;
  }

  function createBattleSurface(type,turns=3){if(!BATTLE_SURFACES[type])return;state.battleSurface={type,turns:turns+(sigilIs('catalyst')?1:0)};spawnFx('word',BATTLE_SURFACES[type].name);updateBattleUi();}
  function tickBattleSurface(){
    const s=state.battleSurface,e=state.battleEnemy,p=state.player;if(!s||!e)return;
    if(s.type==='fire'){const d=5+Math.floor(p.level*.8),dealt=applyPassiveDamage(d,'','fire');ui.battleLog.textContent=`Burning ground scorches ${e.name} for ${dealt}.`;}
    if(s.type==='poison'){const d=4+Math.floor(p.level*.65),dealt=applyPassiveDamage(d,'','poison');ui.battleLog.textContent=`Miasma poisons ${e.name} for ${dealt}.`;}
    if(s.type==='arcane'){p.mp=Math.min(p.maxMp,p.mp+2);spawnFx('heal','+2 MP','hero');}
    if(s.type==='radiant'){const h=Math.min(Math.max(2,Math.floor(p.maxHp*.035)),p.maxHp-p.hp);p.hp+=h;if(h)spawnFx('heal',`+${h}`,'hero');}
    if(s.type==='physical'){e.stagger=Math.min(100,(e.stagger||0)+7);}
    if(hasTalent('veilRecovery')){const mp=Math.min(2,p.maxMp-p.mp);p.mp+=mp;if(mp)spawnFx('heal',`+${mp} MP`,'hero');}
    s.turns-=1;if(s.turns<=0)state.battleSurface=null;
  }

  function useWeaponTechnique(){const p=state.player,e=state.battleEnemy,tech=currentTechnique();if(!e||state.weaponTechniqueCooldown>0||p.stamina<tech.cost)return false;p.stamina-=tech.cost;state.weaponTechniqueCooldown=2;advanceCombo('weaponTechnique',16);let d=0;
    if(equippedWeapon().type==='sword')d=applyEnemyDamage(effectiveAttack()*1.48+randomBetween(3,9),`${tech.name} carves through the foe for {damage} damage!`,{stagger:34,flash:true,type:'physical'});
    if(equippedWeapon().type==='axe'){d=applyEnemyDamage(effectiveAttack()*1.66+randomBetween(5,12),`${tech.name} crashes down for {damage} damage and sunders armor!`,{stagger:42,flash:true,type:'physical'});e.armor=Math.max(7,e.armor-2);}
    if(equippedWeapon().type==='bow'){d=applyEnemyDamage(effectiveAttack()*1.32+randomBetween(3,10),`${tech.name} pins the target for {damage} damage!`,{stagger:24,flash:true,type:'physical'});state.battleRange='far';state.advantageNext=true;}
    if(equippedWeapon().type==='staff'){d=applyEnemyDamage(effectiveAttack()*1.38+p.level*2,`${tech.name} detonates for {damage} arcane damage!`,{skill:true,stagger:30,flash:true,type:'arcane'});p.mp=Math.min(p.maxMp,p.mp+5);createBattleSurface('arcane',2);}
    if(equippedWeapon().type==='mace'){d=applyEnemyDamage(effectiveAttack()*1.4+p.level*2,`${tech.name} tolls for {damage} radiant damage!`,{stagger:48,flash:true,type:'radiant'});state.guarding=true;}
    if(equippedWeapon().type==='dagger'){const crit=Math.random()<.36+stanceCritBonus();const raw=effectiveAttack()*(crit?1.85:1.38)+randomBetween(5,11);d=applyEnemyDamage(raw,`${tech.name}${crit?' critically':''} tears through for {damage} damage!`,{stagger:26,flash:crit,type:'physical'});if(crit)spawnFx('word','CRITICAL!');}
    if(equippedWeapon().type==='rapier'){d=applyEnemyDamage(effectiveAttack()*1.55+randomBetween(4,10),`${tech.name} pierces for {damage} damage!`,{stagger:30,flash:true,type:'physical'});if(!state.reactionUsed){state.reactionReadied=true;state.reactionUsed=true;spawnFx('word','RIPOSTE READY');}}
    if(hasTalent('ruthlessEdge')&&d>0)state.battleMomentum=Math.min(100,state.battleMomentum+6);shakeBattle(6);chord([196,294,392,587]);return true;
  }

  function useParry(){
    const p=state.player,cost=parryCost();
    if(state.parryPrimed){ui.battleLog.textContent='Your parry is already readied.';return false;}
    if(state.parryCooldown>0){ui.battleLog.textContent=`Parry recovers in ${state.parryCooldown} turn${state.parryCooldown===1?'':'s'}.`;beep(90);return false;}
    if((p.stamina||0)<cost){ui.battleLog.textContent=`You need ${cost} Stamina to ready a parry.`;beep(90);return false;}
    p.stamina-=cost;state.parryPrimed=true;state.parryCooldown=2;advanceCombo('parry',12);
    ui.battleLog.textContent='You lower your center of gravity and wait for the strike. Time and steel will decide the counter.';
    spawnFx('word','PARRY READY');animateClass(ui.battleHero,'guard-anim');beep(310,.08,'square',.03);return true;
  }

  function useExecution(){
    const e=state.battleEnemy,p=state.player;if(!e)return false;
    if(!executeReady()){ui.battleLog.textContent='Execution requires a broken, staggered, or badly wounded enemy and enough Momentum.';beep(90);return false;}
    const cost=executionCost();state.battleMomentum=Math.max(0,state.battleMomentum-cost);advanceCombo('execution',20);
    const ability=weaponAbility(),mod=attackBonus()+2,roll=battleD20(true,false),total=roll+mod,target=enemyTargetArmor();showBattleRoll(`${ability.toUpperCase()} EXECUTION`,roll,mod,total);
    if(roll===1||(roll!==20&&total<target)){ui.battleLog.textContent=`The finishing line closes before you can take it. ${e.name} survives.`;spawnFx('word','DENIED');return true;}
    const vulnerable=e.stunned||e.stagger>=72,low=e.hp/e.maxHp<=.25,headsman=hasTalent('headsman');
    let raw=effectiveAttack()*(headsman?2.15:1.8)+e.maxHp*(e.boss?(headsman?.13:.10):(headsman?.25:.20))+randomBetween(8,18);
    if(vulnerable)raw*=1.12;if(roll===20)raw*=1.3;
    const lethal=!e.boss&&low&&e.hp/e.maxHp<=.15;
    if(lethal)raw=Math.max(raw,e.hp+8);
    ui.battle.classList.add('execution-cinematic');setTimeout(()=>ui.battle.classList.remove('execution-cinematic'),900);
    const before=e.hp;applyEnemyDamage(raw,`EXECUTION! You break the opening for {damage} damage!`,{stagger:100,flash:true,type:'physical'});
    if(before>0&&e.hp<=0)state.executions=(state.executions||0)+1;
    spawnFx('word',roll===20?'PERFECT EXECUTION':'EXECUTION');shakeBattle(12);chord([110,165,220,330,440]);return true;
  }

  function useEnvironment(){
    if(state.environmentUsed||!state.battleEnemy)return false;const env=state.battleEnvironment||BATTLE_ENVIRONMENTS.grass,p=state.player,e=state.battleEnemy,terrainMult=hasTalent('terrainMaster')?1.20:1;state.environmentUsed=true;advanceCombo('environment',20);state.battleMomentum=Math.min(100,state.battleMomentum+12);
    if(env.kind==='damage'){applyEnemyDamage((24+p.level*5+equippedWeapon().power*.8)*terrainMult,`${env.name} erupts for {damage} ${env.type} damage!`,{skill:true,prepared:false,stagger:34,flash:true,type:env.type});}
    else if(env.kind==='control'){applyEnemyDamage((12+p.level*3)*terrainMult,`${env.name} crashes into the foe for {damage} damage and heavy stagger!`,{skill:true,prepared:false,stagger:Math.floor(72*terrainMult),flash:true,type:env.type});state.advantageNext=true;}
    else if(env.kind==='arcane'){applyEnemyDamage((28+p.level*5)*terrainMult,`${env.name} detonates for {damage} arcane damage!`,{skill:true,prepared:false,stagger:Math.floor(48*terrainMult),flash:true,type:'arcane'});state.advantageNext=true;}
    else if(env.kind==='heal'){const heal=Math.min(Math.floor(p.maxHp*.34)+p.level*2,p.maxHp-p.hp);p.hp+=heal;p.mp=Math.min(p.maxMp,p.mp+8);spawnFx('heal',`+${heal}`,'hero');ui.battleLog.textContent=`${env.name} restores ${heal} HP and 8 MP.`;}
    else if(env.kind==='mana'){p.mp=Math.min(p.maxMp,p.mp+12);state.advantageNext=true;state.battleMomentum=Math.min(100,state.battleMomentum+20);ui.battleLog.textContent=`${env.name} restores 12 MP and grants advantage on your next attack.`;spawnFx('word','ASTRAL SURGE');}
    else {state.guarding=true;state.battleMomentum=Math.min(100,state.battleMomentum+25);ui.battleLog.textContent=`${env.name} fortifies the party. You brace and gain Momentum.`;spawnFx('word','FORTIFIED');}createBattleSurface(env.type==='fire'?'fire':env.type==='arcane'?'arcane':env.type==='radiant'?'radiant':'physical',3);
    shakeBattle(7);return true;
  }
  function useDodge(){const p=state.player,cost=dodgeCost();if((p.stamina||0)<cost)return false;p.stamina-=cost;state.dodgePrimed=true;state.battleRange=state.battleRange==='close'?'mid':'far';advanceCombo('dodge',10);ui.battleLog.textContent=`You break away to ${state.battleRange.toUpperCase()} range and prepare to evade the next attack.`;spawnFx('word','DODGE READY');animateClass(ui.battleHero,'dodge-anim',520);return true;}
  function shakeBattle(power=5){power*=(window.EmberfallPrefs?.get('shakeIntensity')??100)/100;window.Emberfall2D?.shake?.(power);if(!ui.battle)return;ui.battle.style.setProperty('--shake',`${power}px`);ui.battle.classList.remove('camera-shake');void ui.battle.offsetWidth;ui.battle.classList.add('camera-shake');setTimeout(()=>ui.battle.classList.remove('camera-shake'),420);}

  function finishPlayerTurn(){
    const enemy=state.battleEnemy;state.battleTurns+=1;updateBattleUi();if(enemy.hp<=0){state.battleLocked=true;setBattleButtons(true);setTimeout(victory,430);return;}
    state.battleLocked=true;setBattleButtons(true);setTimeout(enemyTurn,390);
  }

  function battleAction(action){
    if(!state.inBattle||!state.battleEnemy||state.battleLocked||state.timingActive)return;
    const p=state.player;let acted=false;
    const commitAction=()=>{rewardTacticalRead(action);window.dispatchEvent(new CustomEvent('emberfall:action',{detail:{action}}));};
    state.guarding=false;state.battleActiveActor='hero';
    if(action==='attack'){commitAction();startTimingAttack();return;}
    if(action==='skill1'){acted=useJobSkill(1);if(acted)advanceCombo('skill1',8);}
    if(action==='skill2'){acted=useJobSkill(2);if(acted)advanceCombo('skill2',12);}
    if(action==='weaponTechnique'){acted=useWeaponTechnique();}
    if(action==='guard'){state.guarding=true;p.mp=Math.min(p.maxMp,p.mp+4+(equippedRelic()?.guardMp||0)+(hasTalent('channeler')?2:0));p.stamina=Math.min(p.maxStamina,p.stamina+18);const ward=gainBarrier(p.maxHp*(sigilIs('bulwark')?.18:.08),'GUARD WARD');advanceCombo('guard',5);ui.battleLog.textContent=`You brace, recover ${4+(equippedRelic()?.guardMp||0)+(hasTalent('channeler')?2:0)} MP, 18 Stamina${ward?`, and ${ward} Ward`:''}.`;beep(260,.08,'square',.03);animateClass(ui.battleHero,'guard-anim');acted=true;}
    if(action==='dodge'){acted=useDodge();}
    if(action==='parry'){acted=useParry();}
    if(action==='execute'){acted=useExecution();}
    if(action==='environment'){acted=useEnvironment();}
    if(action==='potion'){if(p.potions<1){ui.battleLog.textContent='Your potion pouch is empty.';beep(90);return;}if(p.hp>=p.maxHp){ui.battleLog.textContent='Your HP is already full.';beep(90);return;}p.potions-=1;const healed=Math.min(Math.floor((30+p.level*3)*(1+(runestone().healing||0))),p.maxHp-p.hp);p.hp+=healed;advanceCombo('potion',2);ui.battleLog.textContent=`You recover ${healed} HP.`;spawnFx('heal',`+${healed}`,'hero');chord([523,659]);acted=true;}
    if(action==='bomb'){if(p.bombs<1){ui.battleLog.textContent='You have no Crown Bombs.';beep(90);return;}p.bombs-=1;advanceCombo('bomb',15);const damage=34+p.level*5+randomBetween(0,10);applyEnemyDamage(damage,'The Crown Bomb explodes for {damage} piercing damage!',{stagger:32,flash:true,slash:false,type:'fire'});spawnFx('burst');chord([110,165,82]);acted=true;}
    if(action==='burst')acted=useBurst();
    if(action==='companion'){if(useCompanionAssist())commitAction();return;}
    if(action==='partyTactic'){if(cyclePartyTactic())commitAction();return;}
    if(action==='reaction'){if(readyReaction())commitAction();return;}
    if(action==='position'){const order=['close','mid','far'];state.battleRange=order[(order.indexOf(state.battleRange)+1)%order.length];ui.battleLog.textContent=`You reposition to ${state.battleRange.toUpperCase()} range. Weapon damage modifier: ${Math.round(rangeDamageMultiplier()*100)}%.`;spawnFx('word',state.battleRange.toUpperCase());updateBattleUi();commitAction();return;}
    if(action==='tactic'){const order=['balanced','bold','warded','cunning'];state.battleStance=order[(order.indexOf(state.battleStance)+1)%order.length];ui.battleLog.textContent=`You shift into ${state.battleStance.toUpperCase()} stance. AC ${heroAC()}.`;spawnFx('word',state.battleStance.toUpperCase());updateBattleUi();commitAction();return;}
    if(action==='inspire'){if(state.inspiration<1){ui.battleLog.textContent='You have no Inspiration available.';beep(90);return;}state.inspiration-=1;state.advantageNext=true;state.battleMomentum=Math.min(100,state.battleMomentum+18);ui.battleLog.textContent='You spend Inspiration. Your next weapon attack rolls with advantage.';spawnFx('word','INSPIRED!');updateBattleUi();commitAction();return;}
    if(acted){commitAction();finishPlayerTurn();}
  }

  function enemyTurn(){
    if(!state.inBattle||!state.battleEnemy)return;const enemy=state.battleEnemy,p=state.player;state.battleActiveActor='enemy';
    if(state.companionCooldown>0)state.companionCooldown-=1;if(state.weaponTechniqueCooldown>0)state.weaponTechniqueCooldown-=1;if(state.parryCooldown>0)state.parryCooldown-=1;
    if(hasTalent('channeler'))p.mp=Math.min(p.maxMp,p.mp+1);tickBattleSurface();if(enemy.hp<=0){updateBattleUi();setTimeout(victory,420);return;}
    const traits=enemyTraits(enemy),regen=traits.reduce((sum,t)=>sum+(t.regen||0),0);if(regen){const heal=Math.max(3,Math.floor(enemy.maxHp*regen));enemy.hp=Math.min(enemy.maxHp,enemy.hp+heal);spawnFx('heal',`+${heal}`,'enemy');}
    if(enemy.dotTurns>0){const dotType=({burn:'fire',starfire:'fire',poison:'poison',venom:'poison'})[enemy.dotName]||'physical';enemy.dotTurns-=1;const dealt=applyPassiveDamage(enemy.dotDamage,'',dotType);ui.battleLog.textContent=`${enemy.dotName} deals ${dealt} damage to ${enemy.name}.`;updateBattleUi();if(enemy.hp<=0){setTimeout(victory,520);return;}}
    if(enemy.stunned){enemy.stunned=false;ui.battleLog.textContent=`${enemy.name} is staggered and loses the turn!`;spawnFx('word','OPENING!');chooseEnemyIntent();state.battleActiveActor='hero';state.battleRound+=1;p.stamina=Math.min(p.maxStamina,p.stamina+18+(hasTalent('ironPulse')?6:0));state.battleLocked=false;setBattleButtons(false);updateBattleUi();return;}
    const intent=enemy.intent||'attack';window.dispatchEvent(new CustomEvent('emberfall:enemyaction',{detail:{intent,name:enemy.name}}));
    if(intent==='mend'){const heal=Math.max(8,Math.floor(enemy.maxHp*.14));enemy.hp=Math.min(enemy.maxHp,enemy.hp+heal);ui.battleLog.textContent=`${enemy.name} gathers dark energy and restores ${heal} HP.`;spawnFx('heal',`+${heal}`,'enemy');animateClass(ui.enemySprite,'skill-anim');}
    else if(intent==='brace'){enemy.ward=.5;ui.battleLog.textContent=`${enemy.name} raises an Iron Ward. Its next damage taken is reduced.`;spawnFx('word','WARD');}
    else {
      let multiplier=1,label='attacks';if(intent==='heavy'){multiplier=1.52;label='uses Crushing Blow';}if(intent==='sweep'){multiplier=state.battleRange==='far'?.72:state.battleRange==='close'?1.48:1.15;label='uses a Wide Sweep';}if(intent==='hex'){multiplier=.72;label='casts a Dread Hex';}if(intent==='drain'){multiplier=.82;label='tears at your mana';}if(intent==='ultimate'){multiplier=1.92+(enemy.phase-1)*.12;label='unleashes Crown Catastrophe';}
      if(state.parryPrimed){
        const parryAbility=Math.max(abilityMod('str'),abilityMod('dex')),parryMod=parryAbility+Math.floor(p.level/4)+(hasTalent('duelistGuard')?2:0),parryRoll=rollD20(),parryTotal=parryRoll+parryMod,parryDC=11+Math.floor(enemy.attack/7)+(intent==='ultimate'?4:intent==='heavy'?2:0);showBattleRoll('PARRY',parryRoll,parryMod,parryTotal);state.parryPrimed=false;
        if(parryRoll===20||(parryRoll!==1&&parryTotal>=parryDC)){
          const perfect=parryRoll===20||parryTotal>=parryDC+5,counter=(effectiveAttack()*(perfect?.85:.52)+randomBetween(3,9));state.battleMomentum=Math.min(100,state.battleMomentum+(perfect?34:22));enemy.stagger=Math.min(100,(enemy.stagger||0)+(perfect?48:32));
          applyEnemyDamage(counter,`${perfect?'PERFECT ':''}PARRY! Steel answers steel for {damage} counter damage.`,{stagger:perfect?38:22,flash:true,type:'physical'});if(sigilIs('bulwark'))gainBarrier(p.maxHp*(perfect?.20:.12),'PARRY WARD');spawnFx('word',perfect?'PERFECT PARRY':'PARRY');animateClass(ui.battleHero,'attack-anim');shakeBattle(perfect?9:6);
          if(enemy.hp<=0){state.battleLocked=true;setBattleButtons(true);setTimeout(victory,420);return;}
          chooseEnemyIntent();state.battleActiveActor='hero';state.battleRound+=1;p.stamina=Math.min(p.maxStamina,p.stamina+12+(hasTalent('ironPulse')?6:0));state.battleLocked=false;setBattleButtons(false);updateBattleUi();return;
        } else {ui.battleLog.textContent=`Parry ${parryTotal} vs DC ${parryDC}: the blow breaks through your timing.`;spawnFx('word','PARRY BROKEN');}
      }
      if(state.dodgePrimed){const dodgeRoll=rollD20(),dodgeTotal=dodgeRoll+abilityMod('dex')+Math.floor(p.level/4),dodgeDC=10+Math.floor(enemy.attack/6)+(intent==='ultimate'?3:intent==='heavy'?2:0);showBattleRoll('DODGE',dodgeRoll,abilityMod('dex')+Math.floor(p.level/4),dodgeTotal);state.dodgePrimed=false;if(dodgeRoll===20||(dodgeRoll!==1&&dodgeTotal>=dodgeDC)){const perfect=dodgeRoll===20||dodgeTotal>=dodgeDC+5;ui.battleLog.textContent=`${perfect?'PERFECT EVADE!':'Perfect footwork!'} You slip ${enemy.name}'s ${intentInfo(intent)[0].toLowerCase()} and create a counter-opening.`;state.battleMomentum=Math.min(100,state.battleMomentum+(perfect?30:22));state.advantageNext=true;state.battleFlow=Math.min(100,(state.battleFlow||0)+(perfect?22:14));if(state.battleFlow>=100&&!state.battleFlowReady){state.battleFlowReady=true;spawnFx('word','FLOW SURGE READY');}if(['heavy','sweep','ultimate'].includes(intent))enemy.stagger=Math.min(100,(enemy.stagger||0)+(perfect?24:12));spawnFx('word',perfect?'PERFECT EVADE':'EVADE!');animateClass(ui.battleHero,'dodge-anim',440);chooseEnemyIntent();state.battleActiveActor='hero';state.battleRound+=1;p.stamina=Math.min(p.maxStamina,p.stamina+26+(hasTalent('ironPulse')?6:0));state.battleLocked=false;setBattleButtons(false);updateBattleUi();return;}ui.battleLog.textContent=`Dodge check ${dodgeTotal} vs DC ${dodgeDC}: you are clipped as you move.`;}
      if(p.evasionTurns>0&&Math.random()<.55){p.evasionTurns-=1;ui.battleLog.textContent=`You read the motion and evade ${enemy.name}'s ${intentInfo(intent)[0].toLowerCase()}!`;animateClass(ui.battleHero,'attack-anim');spawnFx('word','EVADE!');beep(520,.07,'square',.025);chooseEnemyIntent();state.guarding=false;p.stamina=Math.min(p.maxStamina||100,(p.stamina||0)+18+(hasTalent('ironPulse')?6:0));if(p.attackBuffTurns>0)p.attackBuffTurns-=1;state.battleActiveActor='hero';state.battleRound+=1;state.battleLocked=false;setBattleButtons(false);updateBattleUi();return;}
      const traitAttackRoll=traits.reduce((sum,t)=>sum+(t.attackRoll||0),0),enemyMod=Math.floor(enemy.attack/5)+(intent==='heavy'?2:intent==='ultimate'?3:0)+rangeEnemyAttackMod()+surfaceAccuracyPenalty()+traitAttackRoll,attackRoll=rollD20(),attackTotal=attackRoll+enemyMod;showBattleRoll(`${enemy.name} ATTACK`,attackRoll,enemyMod,attackTotal);if(attackRoll===1||(attackRoll!==20&&attackTotal<heroAC())){ui.battleLog.textContent=`${enemy.name} ${label}, but rolls ${attackTotal} against AC ${heroAC()} and misses!`;spawnFx('word','MISS!');state.guarding=false;chooseEnemyIntent();state.battleActiveActor='hero';state.battleRound+=1;p.stamina=Math.min(p.maxStamina,p.stamina+(hasTalent('ironPulse')?6:0));state.battleLocked=false;setBattleButtons(false);updateBattleUi();return;}let raw=(enemy.attack+randomBetween(0,6))*multiplier;if(attackRoll===20)raw*=1.45;const reaction=resolveReaction(raw);raw=reaction.raw;if(reaction.note)ui.battleLog.textContent=reaction.note;if(enemy.hp<=0){state.battleLocked=true;setBattleButtons(true);setTimeout(victory,420);return;}if(reaction.evaded){spawnFx('word','EVADE!');chooseEnemyIntent();state.battleActiveActor='hero';state.battleRound+=1;state.guarding=false;state.battleLocked=false;setBattleButtons(false);updateBattleUi();return;}if(['drain','ultimate'].includes(intent)){const saveAbility=intent==='drain'?'wis':'dex',saveMod=abilityMod(saveAbility)+companionCheckBonus(saveAbility)+relicCheckBonus(saveAbility),saveRoll=rollD20(false),saveTotal=saveRoll+saveMod,saveDC=12+Math.floor(enemy.attack/8);showBattleRoll(`${saveAbility.toUpperCase()} SAVE`,saveRoll,saveMod,saveTotal);if(saveRoll===20||(saveRoll!==1&&saveTotal>=saveDC)){raw*=.55;ui.battleLog.textContent=`Saving throw ${saveTotal} vs DC ${saveDC}: success! You blunt the effect.`;}else{ui.battleLog.textContent=`Saving throw ${saveTotal} vs DC ${saveDC}: failed.`;}}if(state.guarding)raw*=intent==='ultimate'?.38:.43;let damage=Math.max(1,Math.floor(raw)-p.defense-Math.floor(p.level/3)),absorbed=Math.min(p.barrier||0,damage);if(absorbed>0){p.barrier-=absorbed;damage-=absorbed;spawnFx('word',`WARD -${absorbed}`);}if(damage>0){p.hp-=damage;state.battleDamageTaken+=damage;}
      if(intent==='hex'){state.disadvantageNext=true;}if(intent==='drain'){const drained=Math.min(p.mp,5+Math.floor(p.level/5));p.mp-=drained;ui.battleLog.textContent=`${enemy.name} ${label} for ${damage} damage${absorbed?` (${absorbed} absorbed)`:''} and drains ${drained} MP!`;}
      else ui.battleLog.textContent=`${reaction.note?reaction.note+' ':''}${enemy.name} ${label} for ${damage} damage${absorbed?` · Ward absorbs ${absorbed}`:''}${state.guarding?' through your guard':''}${intent==='hex'?' and leaves you SHAKEN':''}!`;
      animateClass(ui.enemySprite,'attack-anim');setTimeout(()=>animateClass(ui.battleHero,damage>0?'hit-anim':'guard-anim'),180);spawnFx('number',damage>0?`-${damage}`:'BLOCK','hero');flashBattle(true);if(intent==='ultimate')shakeBattle(10);else if(intent==='heavy')shakeBattle(5);beep(intent==='ultimate'?52:intent==='heavy'?67:80,intent==='ultimate'?.2:.12,'square',.04);
    }
    state.guarding=false;p.stamina=Math.min(p.maxStamina||100,(p.stamina||0)+18+(hasTalent('ironPulse')?6:0));if(p.attackBuffTurns>0)p.attackBuffTurns-=1;if(p.evasionTurns>0&&intent!=='mend'&&intent!=='brace')p.evasionTurns-=1;
    chooseEnemyIntent();state.battleActiveActor='hero';state.battleRound+=1;updateBattleUi();if(p.hp<=0)setTimeout(defeat,650);else{state.battleLocked=false;setBattleButtons(false);}
  }

  function tryWeaponAffix(rank,enemy){
    if(enemy.repeatable||!state.player.equippedWeapon)return null;const nemesisBoost=enemy.elite2&&hasTalent('nemesisHunter')?1.25:1;const chance=({S:.62,A:.38,B:.20,C:.09}[rank]||.08)*(hasTalent('relicSeeker')?1.35:1)*difficultyData().loot*lootBonus()*nemesisBoost;if(Math.random()>=Math.min(.94,chance))return null;const weaponId=state.player.equippedWeapon;state.player.weaponAffixes||={};const owned=state.player.weaponAffixes[weaponId]||[];if(owned.length>=3)return null;const pool=Object.keys(WEAPON_AFFIXES).filter(id=>!owned.includes(id));if(!pool.length)return null;const id=pool[randomBetween(0,pool.length-1)];state.player.weaponAffixes[weaponId]=[...owned,id];const a=WEAPON_AFFIXES[id];state.rareFinds=(state.rareFinds||0)+1;addLog(`${equippedWeapon().name} awakened the ${a.name} affix.`,true);showToast(`${a.rarity.toUpperCase()} AFFIX · ${a.name.toUpperCase()}`);spawnFx('word',`${a.name.toUpperCase()} LOOT`);return id;
  }

  function tryRareRelic(rank,enemy){
    if(enemy.boss||enemy.repeatable)return null;const nemesisBoost=enemy.elite2&&hasTalent('nemesisHunter')?1.3:1;const chance=({S:.22,A:.13,B:.07,C:.035}[rank]||.03)*(hasTalent('relicSeeker')?1.55:1)*difficultyData().loot*lootBonus()*nemesisBoost;if(Math.random()>=Math.min(.72,chance))return null;const available=RARE_RELIC_POOL.filter(id=>!state.player.relics.includes(id));if(!available.length)return null;const id=available[randomBetween(0,available.length-1)];state.player.relics.push(id);state.player.equippedRelic||=id;state.rareFinds=(state.rareFinds||0)+1;addLog(`Rare relic discovered: ${RELICS[id].name}.`,true);showToast(`${(RELICS[id].rarity||'rare').toUpperCase()} RELIC · ${RELICS[id].name.toUpperCase()}`);return id;
  }

  function tryRunestone(rank,enemy){
    if(enemy.repeatable)return null;const base=({S:.34,A:.20,B:.10,C:.045}[rank]||.04),nemesis=enemy.elite2?1.65:enemy.elite?1.25:1,boss=enemy.boss?1.4:1,hunter=enemy.elite2&&hasTalent('nemesisHunter')?1.3:1,chance=base*difficultyData().loot*lootBonus()*nemesis*boss*hunter;
    if(Math.random()>=Math.min(.82,chance))return null;const available=RUNESTONE_POOL.filter(id=>!(state.player.runestones||[]).includes(id));if(!available.length)return null;const id=available[randomBetween(0,available.length-1)],r=RUNESTONES[id];state.player.runestones=[...(state.player.runestones||[]),id];state.player.equippedRunestone||=id;state.runestoneFinds=(state.runestoneFinds||0)+1;state.rareFinds=(state.rareFinds||0)+1;addLog(`Runestone discovered: ${r.name}.`,true);showToast(`${r.rarity.toUpperCase()} RUNESTONE · ${r.name.toUpperCase()}`);spawnFx('word','RUNESTONE FOUND');return id;
  }

  function trySkillSigil(rank,enemy){
    if(enemy.repeatable)return null;const base=({S:.40,A:.25,B:.13,C:.055}[rank]||.05),elite=enemy.elite2?1.75:enemy.elite?1.30:1,boss=enemy.boss?1.45:1,chance=base*difficultyData().loot*lootBonus()*elite*boss;if(Math.random()>=Math.min(.86,chance))return null;
    const available=SKILL_SIGIL_POOL.filter(id=>!(state.player.skillSigils||[]).includes(id));if(!available.length)return null;const id=available[randomBetween(0,available.length-1)],s=SKILL_SIGILS[id];state.player.skillSigils=[...(state.player.skillSigils||[]),id];state.sigilFinds=(state.sigilFinds||0)+1;state.rareFinds=(state.rareFinds||0)+1;addLog(`Skill Sigil discovered: ${s.name}.`,true);showToast(`${s.rarity.toUpperCase()} SIGIL · ${s.name.toUpperCase()}`);return id;
  }
  function showLootReveal(rank,gold,exp,drops=[]){if(!ui.lootReveal||!ui.lootRevealItems)return;ui.lootRevealTitle.textContent=`RANK ${rank} · ${gold} GOLD · ${exp} EXP`;ui.lootRevealItems.innerHTML=drops.length?drops.map(d=>`<span class="loot-line rarity-${d.rarity||'rare'}"><b>${escapeHtml(d.kind)}</b><strong>${escapeHtml(d.name)}</strong></span>`).join(''):'<span class="loot-line common"><b>ROAD SPOILS</b><strong>No rare drop this victory</strong></span>';ui.lootReveal.classList.remove('hidden');void ui.lootReveal.offsetWidth;ui.lootReveal.classList.add('show');setTimeout(()=>{ui.lootReveal.classList.remove('show');ui.lootReveal.classList.add('hidden');},2100);}

  function victory(){
    const loc=currentLocation(),enemy=state.battleEnemy;if(!enemy)return;const enemyRecord=!enemy.repeatable?loc.enemies.find(e=>e.id===state.activeEnemyId):null;if(enemyRecord)enemyRecord.defeated=true;
    let rank='C',multiplier=1;if((state.battleDamageTaken===0&&state.battlePerfects>=1&&state.battleMaxCombo>=4)||(state.battleTacticalReads>=3&&state.battleMaxCombo>=4)){rank='S';multiplier=1.5;}else if(state.battlePerfects>=1||state.battleMaxCombo>=5||state.battleTacticalReads>=2){rank='A';multiplier=1.28;}else if(state.battleMaxCombo>=3||state.battleDamageTaken<state.player.maxHp*.25||state.battleTacticalReads>=1){rank='B';multiplier=1.12;}
    state.huntStreak=Math.min(12,(state.huntStreak||0)+1);state.huntBest=Math.max(state.huntBest||0,state.huntStreak);const huntCache=state.huntStreak%3===0?24+state.huntStreak*7:0;const nemesisGold=enemy.elite2&&hasTalent('nemesisHunter')?1.2:1,baseGold=randomBetween(enemy.gold[0],enemy.gold[1]),readBonus=1+Math.min(.15,(state.battleTacticalReads||0)*.04),gold=Math.floor(baseGold*multiplier*(hasTalent('roadFortune')?1.15:1)*nemesisGold*readBonus)+huntCache;state.player.gold+=gold;state.totalGoldEarned+=gold;state.totalBattles+=1;if(enemy.elite)state.eliteVictories=(state.eliteVictories||0)+1;if(enemy.elite2)state.nemesisVictories=(state.nemesisVictories||0)+1;
    const exp=Math.floor(enemy.exp*(enemy.elite2?1.08:1));gainExp(exp);
    const rawBond=enemy.boss?4:enemy.elite2?3:enemy.elite?2:1,bondGain=Math.max(1,Math.round(rawBond*(hasTalent('kindledOath')?1.5:1)));if(state.companion)state.companionBond=Math.min(100,(state.companionBond||0)+bondGain);
    if(hasTalent('secondWind')){const h=Math.min(Math.max(1,Math.floor(state.player.maxHp*.08)),state.player.maxHp-state.player.hp);state.player.hp+=h;if(h)addLog(`Second Wind restores ${h} HP.`,true);}if(state.companion==='mara'){const heal=Math.min(Math.ceil(state.player.maxHp*.10*bondMultiplier()*(1+(runestone().healing||0))),state.player.maxHp-state.player.hp);if(heal>0){state.player.hp+=heal;addLog(`Mara restores ${heal} HP after the battle.`);}}if(enemy.boss)state.inspiration=Math.min(3,state.inspiration+1);if(rank==='S'&&Math.random()<.45){state.player.bombs+=1;addLog('S-rank bonus: one Crown Bomb.',true);}
    const relicDrop=tryRareRelic(rank,enemy),affixDrop=tryWeaponAffix(rank,enemy),runeDrop=tryRunestone(rank,enemy),sigilDrop=trySkillSigil(rank,enemy);const drops=[];if(relicDrop)drops.push({kind:'RELIC',name:RELICS[relicDrop].name,rarity:RELICS[relicDrop].rarity||'rare'});if(affixDrop)drops.push({kind:'WEAPON AFFIX',name:WEAPON_AFFIXES[affixDrop].name,rarity:WEAPON_AFFIXES[affixDrop].rarity||'rare'});if(runeDrop)drops.push({kind:'RUNESTONE',name:RUNESTONES[runeDrop].name,rarity:RUNESTONES[runeDrop].rarity||'rare'});if(sigilDrop)drops.push({kind:'SKILL SIGIL',name:SKILL_SIGILS[sigilDrop].name,rarity:SKILL_SIGILS[sigilDrop].rarity||'rare'});showLootReveal(rank,gold,exp,drops);
    addLog(`Defeated ${enemy.name} with rank ${rank}. Gained ${gold} gold and ${exp} EXP.${state.companion?` Bond +${bondGain}.`:''} Hunt x${state.huntStreak}.${state.battleTacticalReads?` Tactical reads ${state.battleTacticalReads}.`:''}`);if(huntCache){addLog(`Hunt Chain cache: +${huntCache} gold at x${state.huntStreak}.`,true);showToast(`HUNT CACHE · +${huntCache} GOLD`);}
    const relicId=BOSS_RELICS[enemy.type];if(relicId&&!state.player.relics.includes(relicId)){state.player.relics.push(relicId);state.player.equippedRelic||=relicId;addLog(`Boss relic found: ${RELICS[relicId].name}.`,true);showToast(`RELIC · ${RELICS[relicId].name.toUpperCase()}`);}
    processVictory(enemy.type,enemy.repeatable);ui.battleLog.textContent=`VICTORY — RANK ${rank}! ${gold} gold · ${exp} EXP${enemy.elite2?' · NEMESIS BROKEN':''}`;spawnFx('word',enemy.elite2?`NEMESIS · RANK ${rank}`:`RANK ${rank}`);chord(enemy.boss?[392,523,659,784,1047]:[523,659,784]);setTimeout(()=>{endBattle();if(state.questStage===FINAL_STAGE&&!state.endingSeen)finishStory();},enemy.boss?2250:1900);
  }

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

  function defeat(){const p=state.player;p.hp=p.maxHp;p.mp=p.maxMp;const lostHunt=state.huntStreak||0;state.huntStreak=0;const loss=Math.min(p.gold,Math.max(10,Math.floor(p.gold*.1)));p.gold-=loss;const loc=currentLocation(),respawn=loc.shrine||loc.start;p.x=respawn.x;p.y=respawn.y;ui.battleLog.textContent=`The Seven Roads pull you back from defeat. You lose ${loss} gold${lostHunt?` and Hunt x${lostHunt}`:''}.`;addLog(`You awaken in ${loc.name}. ${loss} gold was lost.${lostHunt?` Hunt Chain x${lostHunt} ended.`:''}`);setTimeout(endBattle,1000);}
  function endBattle(){cancelAnimationFrame(state.timingFrame);state.timingActive=false;window.dispatchEvent(new CustomEvent('emberfall:battleend'));state.inBattle=false;state.battleEnemy=null;state.activeEnemyId=null;state.battleLocked=false;state.guarding=false;state.battleCombo=0;state.battleMaxCombo=0;state.battleMomentum=0;state.battleLastAction='';state.battleFlow=0;state.battleFlowReady=false;state.battleLastDamageType='';state.battleReactionCount=0;state.battlePerfects=0;state.battleDamageTaken=0;state.battleTurns=0;state.battleStance='balanced';state.battleRange='mid';state.battleCompanionUsed=false;state.companionCooldown=0;state.reactionUsed=false;state.reactionReadied=false;state.parryPrimed=false;state.parryCooldown=0;state.battleRound=1;state.battlePhase=1;state.battleEnvironment=null;state.environmentUsed=false;state.dodgePrimed=false;state.weaponTechniqueCooldown=0;state.battleSurface=null;state.battleTacticalReads=0;state.battleReadRound=0;state.player.stamina=state.player.maxStamina||100;state.player.barrier=0;state.initiativeOrder=[];state.battleActiveActor='hero';state.advantageNext=false;state.disadvantageNext=false;state.player.attackBuffTurns=0;state.player.evasionTurns=0;ui.timingPanel.classList.add('hidden');ui.battleFx.innerHTML='';ui.battle.classList.remove('elite-battle','nemesis-battle','execution-cinematic');ui.battle.classList.add('hidden');setBattleButtons(false);updateHud();saveGame(true);}

  function gainExp(amount){const p=state.player;p.exp+=amount;while(p.exp>=p.nextExp){p.exp-=p.nextExp;p.level+=1;p.nextExp=Math.floor(p.nextExp*1.29);p.maxHp+=currentJob().hp>=45?8:6;p.hp=p.maxHp;p.maxMp+=currentJob().mp>=22?4:3;p.mp=p.maxMp;p.baseAttack+=1;if(p.level%3===0)p.defense+=1;if(p.level%2===0){p.talentPoints=(p.talentPoints||0)+1;addLog(`The Road Constellation grants 1 Ascendant point.`,true);}addLog(`Level up! Rowan reached level ${p.level}.`,true);showToast(`LEVEL ${p.level}!`);chord([523,659,784,1047]);}updateHud();}

  function finishStory(){state.endingSeen=true;state.playSeconds=currentPlaySeconds();sessionStartedAt=Date.now();ui.endingText.textContent='Dusk remembers, Sun reveals, Frost restrains, and Star chooses. Together they close the Ember Crown—not under a ruler, but under the shared will of every village and city you saved.';const claimed=Object.values(state.sideQuests).filter(q=>q.status==='claimed').length,d=difficultyData();ui.endingStats.innerHTML=`<div><span>PLAY TIME</span><strong>${formatTime(state.playSeconds)}</strong></div><div><span>WORLD TIER</span><strong>${d.tier} · ${d.name}</strong></div><div><span>JOB</span><strong>${escapeHtml(currentJob().name)}</strong></div><div><span>COMPANION</span><strong>${escapeHtml(companion()?.name||'None')}</strong></div><div><span>BOND</span><strong>${state.companionBond||0} · ${bondRank()}</strong></div><div><span>CHECKS</span><strong>${state.checksSucceeded}/${state.checksAttempted}</strong></div><div><span>RENOWN</span><strong>${state.renown}</strong></div><div><span>CHOICES</span><strong>${state.choicesMade}</strong></div><div><span>RELICS</span><strong>${state.player.relics.length}</strong></div><div><span>RUNESTONES</span><strong>${state.player.runestones?.length||1}</strong></div><div><span>SKILL SIGILS</span><strong>${state.player.skillSigils?.length||1}</strong></div><div><span>PARTY DOCTRINE</span><strong>${partyTactic().name}</strong></div><div><span>EXECUTIONS</span><strong>${state.executions||0}</strong></div><div><span>NEMESIS WINS</span><strong>${state.nemesisVictories||0}</strong></div><div><span>ELITE WINS</span><strong>${state.eliteVictories||0}</strong></div><div><span>CONSTELLATION</span><strong>${talentCount()}/${Object.keys(TALENTS).length}</strong></div><div><span>LEVEL</span><strong>${state.player.level}</strong></div><div><span>VICTORIES</span><strong>${state.totalBattles}</strong></div><div><span>WEAPONS</span><strong>${state.player.weapons.length}</strong></div><div><span>GUILD QUESTS</span><strong>${claimed}/6</strong></div><div><span>LORE</span><strong>${state.counters.lore}/${TOTAL_LORE}</strong></div><div><span>AREAS</span><strong>18</strong></div><div><span>STORY</span><strong>100%</strong></div>`;ui.ending.classList.remove('hidden');addLog('The Ember Crown is sealed by the will of the Seven Roads.',true);chord([392,523,659,784,1047,1319]);saveGame(true);}

  function toggleSound(){state.soundOn=!state.soundOn;ui.sound.textContent=state.soundOn?'♪ SOUND':'× MUTED';ui.sound.setAttribute('aria-pressed',String(state.soundOn));if(state.soundOn)beep(660);}

  // Only used if keybinds.js failed to load for some reason — mirrors its DEFAULTS+aliases so
  // the game degrades to the original hardcoded scheme instead of losing input entirely.
  const LEGACY_KEYMAP={arrowup:'moveUp',w:'moveUp',arrowdown:'moveDown',s:'moveDown',arrowleft:'moveLeft',a:'moveLeft',arrowright:'moveRight',d:'moveRight',' ':'interact',enter:'interact',m:'toggleSound',g:'openGear',c:'openSheet',b:'openBuild',r:'openCamp','1':'battleAttack','2':'battleSkill1','3':'battleSkill2','4':'battleGuard','5':'battlePotion','6':'battleBomb','7':'battleBurst','8':'battleTactic','9':'battleInspire','0':'battleDodge',e:'battleEnvironment',q:'battleWeaponTechnique',p:'battleParry',x:'battleExecute',t:'battlePartyTactic'};

  document.addEventListener('keydown',event=>{
    const key=event.key.toLowerCase();
    // Actions are resolved through the rebindable keymap (keybinds.js) instead of matching
    // literal key strings, so a player rebind takes effect here with no further changes. If
    // keybinds.js failed to load for some reason, fall back to the original hardcoded scheme
    // so the game never becomes unplayable.
    const action=window.EmberfallKeybinds?window.EmberfallKeybinds.resolve(key):LEGACY_KEYMAP[key];
    const handled=!!action||key==='escape';
    if(handled)event.preventDefault();
    if(state.timingActive&&action==='interact'){confirmTimingAttack(false);return;}
    if(state.inBattle&&!state.battleLocked){
      const battleActionOf={battleAttack:'attack',battleSkill1:'skill1',battleSkill2:'skill2',battleGuard:'guard',battlePotion:'potion',battleBomb:'bomb',battleBurst:'burst',battleTactic:'tactic',battleInspire:'inspire',battleDodge:'dodge',battleEnvironment:'environment',battleWeaponTechnique:'weaponTechnique',battleParry:'parry',battleExecute:'execute',battlePartyTactic:'partyTactic',interact:'attack'};
      if(battleActionOf[action]){battleAction(battleActionOf[action]);return;}
    }
    if(key==='escape'){if(!ui.shop.classList.contains('hidden'))closeShop();else if(!ui.gear.classList.contains('hidden'))closeGear();else if(!ui.sheet.classList.contains('hidden'))closeSheet();else if(!ui.camp.classList.contains('hidden'))closeCamp();else if(!ui.build.classList.contains('hidden'))closeBuild();return;}
    if(action==='openGear'){if(ui.gear.classList.contains('hidden'))openGear();else closeGear();return;}
    if(action==='openSheet'){if(ui.sheet.classList.contains('hidden'))openSheet();else closeSheet();return;}
    if(action==='openBuild'){if(ui.build.classList.contains('hidden'))openBuild();else closeBuild();return;}
    if(action==='openCamp'){if(ui.camp.classList.contains('hidden'))openCamp();else closeCamp();return;}
    if(action==='moveUp')move(0,-1);
    if(action==='moveDown')move(0,1);
    if(action==='moveLeft')move(-1,0);
    if(action==='moveRight')move(1,0);
    if(action==='interact')interact();
    if(action==='toggleSound')toggleSound();
  });
  document.querySelectorAll('[data-difficulty]').forEach(button=>button.addEventListener('click',()=>{pendingDifficulty=button.dataset.difficulty||'adventurer';document.querySelectorAll('[data-difficulty]').forEach(card=>card.classList.toggle('selected',card===button));beep(420,.05,'square',.02);showToast(`WORLD TIER ${DIFFICULTIES[pendingDifficulty].tier} · ${DIFFICULTIES[pendingDifficulty].name}`);}));
  document.querySelectorAll('[data-move]').forEach(button=>button.addEventListener('pointerdown',()=>{if(document.body.classList.contains('mobile-device'))return;const directions={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};move(...directions[button.dataset.move]);}));
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>battleAction(button.dataset.action)));
  ui.start.addEventListener('click',startNewGame);ui.continueBtn.addEventListener('click',loadGame);ui.dialogueNext.addEventListener('click',nextDialogue);ui.action.addEventListener('click',interact);ui.sound.addEventListener('click',toggleSound);ui.save.addEventListener('click',()=>saveGame(false));ui.reset.addEventListener('click',resetGame);ui.gearBtn.addEventListener('click',openGear);ui.gearClose.addEventListener('click',closeGear);ui.buildBtn.addEventListener('click',openBuild);ui.buildClose.addEventListener('click',closeBuild);ui.talentResetBtn.addEventListener('click',retrainTalents);ui.sheetBtn.addEventListener('click',openSheet);ui.sheetClose.addEventListener('click',closeSheet);ui.campBtn.addEventListener('click',openCamp);ui.campClose.addEventListener('click',closeCamp);document.querySelectorAll('[data-camp]').forEach(button=>button.addEventListener('click',()=>campAction(button.dataset.camp)));document.getElementById('mobileCampBtn')?.addEventListener('click',openCamp);ui.shopClose.addEventListener('click',closeShop);ui.timingHit.addEventListener('click',()=>confirmTimingAttack(false));ui.explore.addEventListener('click',()=>{ui.ending.classList.add('hidden');drawWorld();});ui.eventAttempt.addEventListener('click',()=>attemptRoadEvent(false));ui.eventInspire.addEventListener('click',()=>attemptRoadEvent(true));ui.eventLeave.addEventListener('click',closeRoadEvent);
  window.addEventListener('beforeunload',()=>{if(state.started&&state.player.job)saveGame(true);});

  resetWorld();renderJobSelection();renderLog();updateHud();animate();
})();
