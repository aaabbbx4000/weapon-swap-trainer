/**
 * Storage Manager - Handles all localStorage operations
 */

class StorageManager {
    /**
     * Load personal bests from localStorage
     */
    static loadPersonalBests() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.PERSONAL_BESTS);
        return saved ? JSON.parse(saved) : {};
    }

    /**
     * Save personal bests to localStorage
     */
    static savePersonalBests(personalBests) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.PERSONAL_BESTS, JSON.stringify(personalBests));
    }

    /**
     * Load round size from localStorage
     */
    static loadRoundSize() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.ROUND_SIZE);
        return saved ? parseInt(saved, 10) : CONFIG.ROUND_SIZE.DEFAULT;
    }

    /**
     * Save round size to localStorage
     */
    static saveRoundSize(size) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.ROUND_SIZE, size.toString());
    }

    /**
     * Load weapon slots from localStorage
     */
    static loadWeaponSlots() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.WEAPON_SLOTS);
        return saved ? JSON.parse(saved) : { ...DEFAULT_WEAPON_SLOTS };
    }

    /**
     * Save weapon slots to localStorage
     */
    static saveWeaponSlots(weaponSlots) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.WEAPON_SLOTS, JSON.stringify(weaponSlots));
    }

    /**
     * Load fake attacks enabled setting from localStorage
     */
    static loadFakeAttacksEnabled() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.FAKE_ATTACKS_ENABLED);
        return saved !== null ? saved === 'true' : CONFIG.FAKE_ATTACKS.DEFAULT_ENABLED;
    }

    /**
     * Save fake attacks enabled setting to localStorage
     */
    static saveFakeAttacksEnabled(enabled) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.FAKE_ATTACKS_ENABLED, enabled.toString());
    }

    /**
     * Load fake attacks cancellation key from localStorage
     */
    static loadFakeAttacksCancelKey() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.FAKE_ATTACKS_CANCEL_KEY);
        return saved || CONFIG.FAKE_ATTACKS.DEFAULT_CANCEL_KEY;
    }

    /**
     * Save fake attacks cancellation key to localStorage
     */
    static saveFakeAttacksCancelKey(key) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.FAKE_ATTACKS_CANCEL_KEY, key);
    }

    /**
     * Load pressure mode enabled setting from localStorage
     */
    static loadPressureModeEnabled() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.PRESSURE_MODE_ENABLED);
        return saved !== null ? saved === 'true' : CONFIG.PRESSURE_MODE.DEFAULT_ENABLED;
    }

    /**
     * Save pressure mode enabled setting to localStorage
     */
    static savePressureModeEnabled(enabled) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.PRESSURE_MODE_ENABLED, enabled.toString());
    }

    /**
     * Load pressure mode drain rate from localStorage
     */
    static loadPressureDrainRate() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.PRESSURE_DRAIN_RATE);
        return saved ? parseFloat(saved) : CONFIG.PRESSURE_MODE.DEFAULT_DRAIN_RATE;
    }

    /**
     * Save pressure mode drain rate to localStorage
     */
    static savePressureDrainRate(rate) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.PRESSURE_DRAIN_RATE, rate.toString());
    }

    /**
     * Load slot keybindings from localStorage
     */
    static loadSlotKeybindings() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.SLOT_KEYBINDINGS);
        return saved ? JSON.parse(saved) : { ...DEFAULT_SLOT_KEYBINDINGS };
    }

    /**
     * Save slot keybindings to localStorage
     */
    static saveSlotKeybindings(slotKeybindings) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.SLOT_KEYBINDINGS, JSON.stringify(slotKeybindings));
    }

    /**
     * Load common patterns from localStorage
     * Returns array of pattern objects: [{ from: { weapon, skill }, to: { weapon, skill } }, ...]
     */
    static loadCommonPatterns() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.COMMON_PATTERNS);
        if (!saved) return [...CONFIG.COMMON_PATTERNS.DEFAULT_PATTERNS];

        const patterns = JSON.parse(saved);

        // Migrate old string format to object format
        return patterns.map(p => this.migratePattern(p));
    }

    /**
     * Migrate old string pattern format to object format
     */
    static migratePattern(pattern) {
        // Already in new format
        if (pattern.from && typeof pattern.from === 'object') {
            return pattern;
        }

        // Convert string format "Weapon-Skill" to object { weapon, skill }
        const parseSkillString = (str) => {
            if (!str) return null;
            const lastDash = str.lastIndexOf('-');
            if (lastDash === -1) return null;
            return {
                weapon: str.substring(0, lastDash),
                skill: str.substring(lastDash + 1)
            };
        };

        return {
            from: parseSkillString(pattern.from),
            to: parseSkillString(pattern.to)
        };
    }

    /**
     * Save common patterns to localStorage
     */
    static saveCommonPatterns(patterns) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.COMMON_PATTERNS, JSON.stringify(patterns));
    }

    /**
     * Load pattern likelihood from localStorage
     */
    static loadPatternLikelihood() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.PATTERN_LIKELIHOOD);
        return saved ? parseInt(saved, 10) : CONFIG.COMMON_PATTERNS.DEFAULT_LIKELIHOOD;
    }

    /**
     * Save pattern likelihood to localStorage
     */
    static savePatternLikelihood(likelihood) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.PATTERN_LIKELIHOOD, likelihood.toString());
    }

    /**
     * Generic load from localStorage
     */
    static load(key) {
        const saved = localStorage.getItem(key);
        if (!saved) return null;
        try {
            return JSON.parse(saved);
        } catch {
            return saved;
        }
    }

    /**
     * Generic save to localStorage
     */
    static save(key, value) {
        if (typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            localStorage.setItem(key, value.toString());
        }
    }
}
