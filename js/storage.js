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
     * Load auto-advance setting from localStorage
     */
    static loadAutoAdvance() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTO_ADVANCE);
        return saved === 'true';
    }

    /**
     * Save auto-advance setting to localStorage
     */
    static saveAutoAdvance(enabled) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTO_ADVANCE, enabled.toString());
    }

    /**
     * Load auto-advance delay from localStorage
     */
    static loadAutoAdvanceDelay() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTO_ADVANCE_DELAY);
        return saved ? parseFloat(saved) : CONFIG.AUTO_ADVANCE.DEFAULT_DELAY;
    }

    /**
     * Save auto-advance delay to localStorage
     */
    static saveAutoAdvanceDelay(delay) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTO_ADVANCE_DELAY, delay.toString());
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
     * Load include skills setting from localStorage
     */
    static loadIncludeSkills() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.INCLUDE_SKILLS);
        return saved !== null ? saved === 'true' : CONFIG.TRAINING_MODE.DEFAULT_INCLUDE_SKILLS;
    }

    /**
     * Save include skills setting to localStorage
     */
    static saveIncludeSkills(includeSkills) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.INCLUDE_SKILLS, includeSkills.toString());
    }
}
