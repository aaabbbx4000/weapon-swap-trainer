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
        DEFAULT: 50,
        MIN: 1,
        MAX: 9999
    },

    FAKE_ATTACKS: {
        DEFAULT_ENABLED: false,
        DEFAULT_CANCEL_KEY: 'Mouse3'
    },

    PRESSURE_MODE: {
        DEFAULT_ENABLED: true,
        DEFAULT_DRAIN_RATE: 6.0,      // Percentage points per second
        MIN_DRAIN_RATE: 0.5,
        MAX_DRAIN_RATE: 10.0,
        SUCCESS_BOOST: 7.5,           // Percentage boost on success
        ERROR_PENALTY: 25,            // Percentage penalty on error
        WARNING_THRESHOLD: 30,
        CRITICAL_THRESHOLD: 15
    },

    WEAPON_SELECT_MODE: {
        DEFAULT_NOTE_SPEED: 'slow',     // learning, slower, slow, medium, fast
        NOTE_SPEEDS: {
            learning: 5000,  // ms for note to fall
            slower: 4000,
            slow: 3200,
            medium: 2500,
            fast: 2000
        },
        DEFAULT_SPAWN_RATE: 800,        // ms between notes
        SPAWN_RATES: {
            learning: 2000,
            slower: 1600,
            slow: 1300,
            medium: 1000,
            fast: 800
        },
        HIT_WINDOW: 200,                // ms before/after target for a hit
        HIT_LINE_BOTTOM_PX: 100,        // hit line position from bottom (pixels)
        NOTE_HEIGHT: 60,                // approximate note height for hit detection
        NOTE_START_OFFSET: 60,          // animation starts this far above container (must match CSS)
        NOTE_END_OFFSET: 120,           // animation ends this far below container (must match CSS)
        DEFAULT_DURATION: 60,           // seconds
        DURATIONS: [30, 60, 90, 0],     // 0 = endless
        LANE_COUNT: 8
    },

    COMMON_PATTERNS: {
        DEFAULT_LIKELIHOOD: 100,  // Percentage chance pattern will be followed
        DEFAULT_PATTERNS: [
            { from: { weapon: 'Slasher', skill: 'E' }, to: { weapon: 'Spear', skill: 'Q' } },
            { from: { weapon: 'Sword', skill: 'E' }, to: { weapon: 'Reaper', skill: 'Q' } },
            { from: { weapon: 'Axe', skill: 'E' }, to: { weapon: 'Greatsword', skill: 'Q' } },
            { from: { weapon: 'Reaper', skill: 'E' }, to: { weapon: 'Spear', skill: 'Q' } },
            { from: { weapon: 'Pistols', skill: 'E' }, to: { weapon: 'Greatsword', skill: 'Q' } }
        ]
    },

    STORAGE_KEYS: {
        PERSONAL_BESTS: 'componentPBs',
        ROUND_SIZE: 'roundSize',
        WEAPON_SLOTS: 'weaponSlots',
        SLOT_KEYBINDINGS: 'slotKeybindings',
        FAKE_ATTACKS_ENABLED: 'fakeAttacksEnabled',
        FAKE_ATTACKS_CANCEL_KEY: 'fakeAttacksCancelKey',
        PRESSURE_MODE_ENABLED: 'pressureModeEnabled',
        PRESSURE_DRAIN_RATE: 'pressureDrainRate',
        WEAPON_SELECT_NOTE_SPEED: 'weaponSelectNoteSpeed',
        WEAPON_SELECT_DURATION: 'weaponSelectDuration',
        COMMON_PATTERNS: 'commonPatterns',
        PATTERN_LIKELIHOOD: 'patternLikelihood'
    }
};

const SCREENS = {
    WELCOME: 'welcomeScreen',
    COUNTDOWN: 'countdownScreen',
    TRAINING: 'trainingScreen',
    RESULTS: 'resultsScreen',
    WEAPON_SELECT: 'weaponSelectScreen'
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
    1: 'Spear',
    2: 'Greatsword',
    3: 'LongBow',
    4: 'Axe',
    5: 'Sword',
    6: 'Pistols',
    7: 'Slasher',
    8: 'Reaper'
};

// Default keybindings for weapon slots (slot number -> key)
const DEFAULT_SLOT_KEYBINDINGS = {
    1: '1',
    2: '2',
    3: '3',
    4: 'r',
    5: 'Mouse5',
    6: 'Mouse4',
    7: 'x',
    8: 'c'
};

// Weapon skills that support fake attacks (weapon-skill pairs)
const FAKE_ATTACK_SKILLS = [
    { weapon: 'Greatsword', skill: 'Q' },
    { weapon: 'Sword', skill: 'E' },
    { weapon: 'Axe', skill: 'E' }
];
