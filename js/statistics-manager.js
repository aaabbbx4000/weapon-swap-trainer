/**
 * Statistics Manager - Handles personal bests and round statistics
 */

import { StorageManager } from './storage.js';

export class StatisticsManager {
    constructor() {
        this.personalBests = StorageManager.loadPersonalBests();
    }

    /**
     * Get personal best for a component key
     */
    getPersonalBest(key) {
        return this.personalBests[key] || null;
    }

    /**
     * Update personal best if time is better
     * Returns true if new PB was set
     */
    updatePersonalBest(key, time) {
        const currentPB = this.personalBests[key];

        if (!currentPB || time < currentPB) {
            this.personalBests[key] = time;
            this.save();
            return true;
        }

        return false;
    }

    /**
     * Get all personal bests sorted by time
     */
    getAllSorted() {
        return Object.entries(this.personalBests)
            .sort((a, b) => a[1] - b[1]);
    }

    /**
     * Reset all personal bests
     */
    resetAll() {
        this.personalBests = {};
        this.save();
    }

    /**
     * Calculate round statistics
     */
    calculateRoundStats(results) {
        if (results.length === 0) {
            return {
                average: 0,
                fastest: 0,
                slowest: 0,
                newPBCount: 0
            };
        }

        const times = results.map(r => r.time);
        const average = times.reduce((sum, time) => sum + time, 0) / times.length;
        const fastest = Math.min(...times);
        const slowest = Math.max(...times);
        const newPBCount = results.filter(r => r.isNewPB).length;

        return {
            average,
            fastest,
            slowest,
            newPBCount
        };
    }

    /**
     * Save personal bests to storage
     */
    save() {
        StorageManager.savePersonalBests(this.personalBests);
    }

    /**
     * Check if there are any personal bests
     */
    hasAny() {
        return Object.keys(this.personalBests).length > 0;
    }
}
