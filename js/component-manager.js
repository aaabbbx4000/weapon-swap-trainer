/**
 * Weapon Manager - Handles weapon slots and skill generation
 */

class ComponentManager {
    constructor() {
        this.weaponSlots = {};
        this.skills = ['Q', 'E'];
        this.fakeAttacksEnabled = false;
        this.cancelKey = 'x';
    }

    /**
     * Initialize by loading weapon slots
     */
    async init() {
        this.weaponSlots = StorageManager.loadWeaponSlots();
    }

    /**
     * Set fake attacks configuration
     */
    setFakeAttacksConfig(enabled, cancelKey) {
        this.fakeAttacksEnabled = enabled;
        this.cancelKey = cancelKey;
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
        const components = [];

        for (let slot = 1; slot <= 8; slot++) {
            const weapon = this.weaponSlots[slot];
            if (weapon) {
                for (const skill of this.skills) {
                    // Add normal weapon skill
                    components.push({
                        key: `${slot},${skill}`,
                        description: `${weapon} ${skill}`,
                        slot: slot,
                        weapon: weapon,
                        skill: skill,
                        isFake: false
                    });

                    // Add fake attack variant if enabled and this skill supports it
                    if (this.fakeAttacksEnabled && this.isFakeAttackSkill(weapon, skill)) {
                        components.push({
                            key: `${slot},${skill},${this.cancelKey}`,
                            description: `${weapon} ${skill} Fake Attack`,
                            slot: slot,
                            weapon: weapon,
                            skill: skill,
                            isFake: true,
                            cancelKey: this.cancelKey
                        });
                    }
                }
            }
        }

        return components;
    }

    /**
     * Check if a weapon-skill combination supports fake attacks
     */
    isFakeAttackSkill(weapon, skill) {
        return FAKE_ATTACK_SKILLS.some(
            fake => fake.weapon === weapon && fake.skill === skill
        );
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
        const components = this.getAllComponents();

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
