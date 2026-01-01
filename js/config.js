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

    STORAGE_KEYS: {
        PERSONAL_BESTS: 'componentPBs',
        ROUND_SIZE: 'roundSize',
        AUTO_ADVANCE: 'autoAdvance',
        AUTO_ADVANCE_DELAY: 'autoAdvanceDelay',
        WEAPON_SLOTS: 'weaponSlots'
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

const WEAPON_IMAGES = {
    'Spear': 'images/Weapon_SanguineSpear.webp',
    'Slasher': 'images/Weapon_SanguineSlashers.webp',
    'Axe': 'images/Weapon_SanguineAxes.webp',
    'Mace': 'images/Weapon_SanguineMace.webp',
    'Sword': 'images/Weapon_SanguineSword.webp',
    'Crossbow': 'images/Weapon_SanguineCrossbow.webp',
    'Greatsword': 'images/Weapon_SanguineGreatsword.webp',
    'Whip': 'images/Weapon_SanguineWhip.webp',
    'LongBow': 'images/Weapon_SanguineLongbow.webp',
    'Dagger': 'images/Weapon_SanguineDaggers.webp',
    'Claw': 'images/Weapon_SanguineClaws.webp',
    'TwinBlade': 'images/Weapon_SanguineTwinblade.webp',
    'Pistols': 'images/Weapon_SanguinePistols.webp',
    'Reaper': 'images/Weapon_SanguineReaper.webp'
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
