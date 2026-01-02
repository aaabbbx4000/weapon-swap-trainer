/**
 * Application Configuration
 */

const CONFIG = {
    COUNTDOWN_START: 2,
    COUNTDOWN_INTERVAL: 1000,
    TIMER_UPDATE_INTERVAL: 10,
    COMPONENT_TRANSITION_DELAY: 250,
    SKIP_TRANSITION_DELAY: 250,
    ERROR_FLASH_DURATION: 200,

    ROUND_SIZE: {
        DEFAULT: 20,
        MIN: 1,
        MAX: 9999
    },

    AUTO_ADVANCE: {
        DEFAULT_ENABLED: false,
        DEFAULT_DELAY: 3.0,
        MIN_DELAY: 0.1,
        MAX_DELAY: 10
    },

    FAKE_ATTACKS: {
        DEFAULT_ENABLED: false,
        DEFAULT_CANCEL_KEY: 'x'
    },

    STORAGE_KEYS: {
        PERSONAL_BESTS: 'componentPBs',
        ROUND_SIZE: 'roundSize',
        AUTO_ADVANCE: 'autoAdvance',
        AUTO_ADVANCE_DELAY: 'autoAdvanceDelay',
        WEAPON_SLOTS: 'weaponSlots',
        SLOT_KEYBINDINGS: 'slotKeybindings',
        FAKE_ATTACKS_ENABLED: 'fakeAttacksEnabled',
        FAKE_ATTACKS_CANCEL_KEY: 'fakeAttacksCancelKey'
    }
};

const SCREENS = {
    WELCOME: 'welcomeScreen',
    COUNTDOWN: 'countdownScreen',
    TRAINING: 'trainingScreen',
    RESULTS: 'resultsScreen'
};

const KEY_MAPPINGS = {
    ' ': 'SPACE',
    'LeftMouseButton': 'LEFT CLICK'
};

const WEAPONS = [
    'Spear',
    'Slasher',
    'Axe',
    'Mace',
    'Sword',
    'Crossbow',
    'Greatsword',
    'Whip',
    'LongBow',
    'Dagger',
    'Claw',
    'TwinBlade',
    'Pistols',
    'Reaper'
];

// Weapon skill images mapping (weapon + skill -> image path)
const WEAPON_SKILL_IMAGES = {
    'Spear-q': 'images/weapon skills/spear q.png',
    'Spear-e': 'images/weapon skills/spear e.png',
    'Slasher-q': 'images/weapon skills/slasher q.png',
    'Slasher-e': 'images/weapon skills/slasher e.png',
    'Axe-q': 'images/weapon skills/axe q.png',
    'Axe-e': 'images/weapon skills/axes e.png',
    'Mace-q': 'images/weapon skills/mace q.png',
    'Mace-e': 'images/weapon skills/mace e.png',
    'Sword-q': 'images/weapon skills/sword q.png',
    'Sword-e': 'images/weapon skills/sword e.png',
    'Crossbow-q': 'images/weapon skills/crossbow q.png',
    'Crossbow-e': 'images/weapon skills/crossbow e.png',
    'Greatsword-q': 'images/weapon skills/greatsword q.png',
    'Greatsword-e': 'images/weapon skills/greatsword e.png',
    'Whip-q': 'images/weapon skills/whip q.png',
    'Whip-e': 'images/weapon skills/whip e.png',
    'LongBow-q': 'images/weapon skills/longbow q.png',
    'LongBow-e': 'images/weapon skills/longbow e.png',
    'Dagger-q': 'images/weapon skills/daggers q.png',
    'Dagger-e': 'images/weapon skills/daggers e.png',
    'Claw-q': 'images/weapon skills/claws q.png',
    'Claw-e': 'images/weapon skills/claws e.png',
    'TwinBlade-q': 'images/weapon skills/twinblades q.png',
    'TwinBlade-e': 'images/weapon skills/twinblades e.png',
    'Pistols-q': 'images/weapon skills/pistols q.png',
    'Pistols-e': 'images/weapon skills/pistols e.png',
    'Reaper-q': 'images/weapon skills/reaper q.png',
    'Reaper-e': 'images/weapon skills/reaper e.png'
};

const DEFAULT_WEAPON_SLOTS = {
    1: 'LongBow',
    2: 'Reaper',
    3: 'Spear',
    4: 'Axe',
    5: 'Slasher',
    6: 'Pistols',
    7: 'Sword',
    8: 'Greatsword'
};

// Default keybindings for weapon slots (slot number -> key)
const DEFAULT_SLOT_KEYBINDINGS = {
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8'
};

// Weapon skills that support fake attacks (weapon-skill pairs)
const FAKE_ATTACK_SKILLS = [
    { weapon: 'Greatsword', skill: 'Q' },
    { weapon: 'Sword', skill: 'E' },
    { weapon: 'Axe', skill: 'E' }
];
