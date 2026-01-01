/**
 * Weapon Manager - Handles weapon slots and skill generation
 */

class ComponentManager {
    constructor() {
        this.weaponSlots = {};
        this.skills = ['Q', 'E'];
    }

    /**
     * Initialize by loading weapon slots
     */
    async init() {
        this.weaponSlots = StorageManager.loadWeaponSlots();
    }

    /**
     * Get weapon slots configuration
     */
    getWeaponSlots() {
        return this.weaponSlots;
    }

    /**
     * Update weapon for a specific slot
     */
    setWeaponSlot(slot, weaponName) {
        if (slot < 1 || slot > 8) {
            throw new Error('Slot must be between 1 and 8');
        }

        if (weaponName && !WEAPONS.includes(weaponName)) {
            throw new Error('Invalid weapon name');
        }

        this.weaponSlots[slot] = weaponName;
        this.save();
    }

    /**
     * Get all possible weapon skills from current configuration
     */
    getAllComponents() {
        const skills = [];

        for (let slot = 1; slot <= 8; slot++) {
            const weapon = this.weaponSlots[slot];
            if (weapon) {
                for (const skill of this.skills) {
                    skills.push({
                        key: `${slot},${skill}`,
                        description: `${weapon} ${skill}`,
                        slot: slot,
                        weapon: weapon,
                        skill: skill
                    });
                }
            }
        }

        return skills;
    }

    /**
     * Find weapon skill by key
     */
    findByKey(key) {
        const skills = this.getAllComponents();
        return skills.find(c => c.key === key);
    }

    /**
     * Generate random round of weapon skills
     */
    generateRound(size) {
        const skills = this.getAllComponents();

        if (skills.length === 0) {
            throw new Error('No weapons configured in slots. Please configure weapons in slots 1-8.');
        }

        const round = [];
        const availableSkills = [...skills];

        for (let i = 0; i < size; i++) {
            const randomIndex = Math.floor(Math.random() * availableSkills.length);
            round.push(availableSkills[randomIndex]);
            availableSkills.splice(randomIndex, 1);

            if (availableSkills.length === 0) {
                availableSkills.push(...skills);
            }
        }

        return round;
    }

    /**
     * Save weapon slots to storage
     */
    save() {
        StorageManager.saveWeaponSlots(this.weaponSlots);
    }
}
