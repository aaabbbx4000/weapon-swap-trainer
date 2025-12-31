/**
 * Application Configuration
 */

const CONFIG = {
    COUNTDOWN_START: 3,
    COUNTDOWN_INTERVAL: 1000,
    TIMER_UPDATE_INTERVAL: 10,
    COMPONENT_TRANSITION_DELAY: 800,
    SKIP_TRANSITION_DELAY: 300,
    ERROR_FLASH_DURATION: 200,

    ROUND_SIZE: {
        DEFAULT: 10,
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
        COMPONENTS: 'components',
        PERSONAL_BESTS: 'componentPBs',
        ROUND_SIZE: 'roundSize',
        AUTO_ADVANCE: 'autoAdvance',
        AUTO_ADVANCE_DELAY: 'autoAdvanceDelay'
    }
};

const DEFAULT_COMPONENTS = [
    { key: "1,q", description: "greatsword attack" },
    { key: "2,LeftMouseButton", description: "crossbow auto" },
    { key: "2,e", description: "crossbow attack" },
    { key: "3,q", description: "spear attack" },
    { key: "4,q", description: "whip attack" },
    { key: "4,LeftMouseButton", description: "whip auto" },
    { key: "5,q", description: "slashers iframe" },
    { key: "5,e", description: "slashers invis" },
    { key: "6,e", description: "pistols iframe" },
    { key: "6,LeftMouseButton", description: "pistols auto" },
    { key: "8,q", description: "reaper attack" },
    { key: "7,e", description: "twinblades attack" }
];

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
