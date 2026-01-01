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
    getAllComponents(includeSkills = true) {
        const components = [];

        for (let slot = 1; slot <= 8; slot++) {
            const weapon = this.weaponSlots[slot];
            if (weapon) {
                if (includeSkills) {
                    // Include Q and E skills
                    for (const skill of this.skills) {
                        components.push({
                            key: `${slot},${skill}`,
                            description: `${weapon} ${skill}`,
                            slot: slot,
                            weapon: weapon,
                            skill: skill
                        });
                    }
                } else {
                    // Weapon swap only (no Q/E)
                    components.push({
                        key: `${slot}`,
                        description: `${weapon}`,
                        slot: slot,
                        weapon: weapon,
                        skill: null
                    });
                }
            }
        }

        return components;
    }

    /**
     * Find weapon skill by key
     */
    findByKey(key) {
        const skills = this.getAllComponents();
        return skills.find(c => c.key === key);
    }

    /**
     * Generate random round of weapon skills or swaps
     */
    generateRound(size, includeSkills = true) {
        const components = this.getAllComponents(includeSkills);

        if (components.length === 0) {
            throw new Error('No weapons configured in slots. Please configure weapons in slots 1-8.');
        }

        const round = [];
        const availableComponents = [...components];

        for (let i = 0; i < size; i++) {
            const randomIndex = Math.floor(Math.random() * availableComponents.length);
            round.push(availableComponents[randomIndex]);
            availableComponents.splice(randomIndex, 1);

            if (availableComponents.length === 0) {
                availableComponents.push(...components);
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
