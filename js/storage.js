/**
 * Storage Manager - Handles all localStorage operations
 */

class StorageManager {
    /**
     * Load components from localStorage, or fetch from components.json if empty
     */
    static async loadComponents() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.COMPONENTS);
        if (saved) {
            try {
                const loaded = JSON.parse(saved);
                if (Array.isArray(loaded) && loaded.length > 0) {
                    return loaded;
                }
            } catch (error) {
                console.error('Error loading components:', error);
            }
        }

        // Try to load from components.json file
        try {
            const response = await fetch('components.json');
            if (response.ok) {
                const components = await response.json();
                if (Array.isArray(components) && components.length > 0) {
                    return components;
                }
            }
        } catch (error) {
            console.log('No components.json file found, starting with empty list');
        }

        // Return empty array if no data found
        return [];
    }

    /**
     * Save components to localStorage
     */
    static saveComponents(components) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.COMPONENTS, JSON.stringify(components));
    }

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
}
