/**
 * Weapon Manager - Handles weapon slots and skill generation
 */

class ComponentManager {
    constructor() {
        this.weaponSlots = {};
        this.slotKeybindings = {};
        this.skills = ['Q', 'E'];
        this.fakeAttacksEnabled = false;
        this.cancelKey = 'x';
        this.commonPatterns = [];
        this.patternLikelihood = 100;
    }

    /**
     * Initialize by loading weapon slots and keybindings
     */
    async init() {
        this.weaponSlots = StorageManager.loadWeaponSlots();
        this.slotKeybindings = StorageManager.loadSlotKeybindings();
        this.commonPatterns = StorageManager.loadCommonPatterns();
        this.patternLikelihood = StorageManager.loadPatternLikelihood();
    }

    /**
     * Set fake attacks configuration
     */
    setFakeAttacksConfig(enabled, cancelKey) {
        // Check if cancel key conflicts with any slot keybinding
        if (enabled && cancelKey) {
            for (let slot = 1; slot <= 8; slot++) {
                if (this.slotKeybindings[slot] && this.slotKeybindings[slot].toLowerCase() === cancelKey.toLowerCase()) {
                    throw new Error(`Cancellation key "${cancelKey}" is already assigned to slot ${slot}`);
                }
            }
        }

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
     * Get slot keybindings configuration
     */
    getSlotKeybindings() {
        return this.slotKeybindings;
    }

    /**
     * Update keybinding for a specific slot
     */
    setSlotKeybinding(slot, key) {
        if (slot < 1 || slot > 8) {
            throw new Error('Slot must be between 1 and 8');
        }

        if (!key || key.length === 0) {
            throw new Error('Key cannot be empty');
        }

        // Check for duplicate slot keybindings
        for (let i = 1; i <= 8; i++) {
            if (i !== slot && this.slotKeybindings[i] && this.slotKeybindings[i].toLowerCase() === key.toLowerCase()) {
                throw new Error(`Key "${key}" is already assigned to slot ${i}`);
            }
        }

        // Check if key conflicts with cancel key
        if (this.fakeAttacksEnabled && this.cancelKey && this.cancelKey.toLowerCase() === key.toLowerCase()) {
            throw new Error(`Key "${key}" is already used as the cancellation key`);
        }

        this.slotKeybindings[slot] = key;
        this.saveKeybindings();
    }

    /**
     * Get all possible weapon skills from current configuration
     */
    getAllComponents() {
        const components = [];

        for (let slot = 1; slot <= 8; slot++) {
            const weapon = this.weaponSlots[slot];
            const slotKey = this.slotKeybindings[slot] || slot.toString();

            if (weapon) {
                for (const skill of this.skills) {
                    // Add normal weapon skill
                    components.push({
                        key: `${slotKey},${skill}`,
                        description: `${weapon} ${skill}`,
                        slot: slot,
                        slotKey: slotKey,
                        weapon: weapon,
                        skill: skill,
                        isFake: false
                    });

                    // Add fake attack variant if enabled and this skill supports it
                    if (this.fakeAttacksEnabled && this.isFakeAttackSkill(weapon, skill)) {
                        components.push({
                            key: `${slotKey},${skill},${this.cancelKey}`,
                            description: `${weapon} ${skill} Fake Attack`,
                            slot: slot,
                            slotKey: slotKey,
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
     * Generate random round of weapon skills (pattern-aware)
     */
    generateRound(size) {
        const components = this.getAllComponents();

        if (components.length === 0) {
            throw new Error('No weapons configured in slots. Please configure weapons in slots 1-8.');
        }

        const round = [];
        const availableComponents = [...components];

        for (let i = 0; i < size; i++) {
            let selectedComponent;

            // Try to use pattern-aware selection if we have a previous component
            if (i > 0 && this.commonPatterns.length > 0) {
                const prevComponent = round[i - 1];
                selectedComponent = this.selectWithPattern(prevComponent, availableComponents, components);
            }

            // If no pattern was used, select randomly
            if (!selectedComponent) {
                const randomIndex = Math.floor(Math.random() * availableComponents.length);
                selectedComponent = availableComponents[randomIndex];
            }

            round.push(selectedComponent);

            // Remove from available pool
            const indexInAvailable = availableComponents.indexOf(selectedComponent);
            if (indexInAvailable !== -1) {
                availableComponents.splice(indexInAvailable, 1);
            }

            if (availableComponents.length === 0) {
                availableComponents.push(...components);
            }
        }

        return round;
    }

    /**
     * Select next component using pattern matching
     * Returns null if no pattern should be used
     */
    selectWithPattern(prevComponent, availableComponents, allComponents) {
        // Find all patterns that match the previous component
        const matchingPatterns = this.commonPatterns.filter(p =>
            p.from &&
            p.to &&
            p.from.weapon === prevComponent.weapon &&
            p.from.skill === prevComponent.skill
        );

        if (matchingPatterns.length === 0) {
            return null;
        }

        // Check if we should follow the pattern based on likelihood
        if (Math.random() * 100 >= this.patternLikelihood) {
            return null;
        }

        // Randomly select one of the matching patterns
        const selectedPattern = matchingPatterns[Math.floor(Math.random() * matchingPatterns.length)];
        const targetWeapon = selectedPattern.to.weapon;
        const targetSkill = selectedPattern.to.skill;

        // Find matching component in available pool first, then all components
        let targetComponent = availableComponents.find(
            c => c.weapon === targetWeapon && c.skill === targetSkill && !c.isFake
        );

        if (!targetComponent) {
            // Try from all components if not in available pool
            targetComponent = allComponents.find(
                c => c.weapon === targetWeapon && c.skill === targetSkill && !c.isFake
            );
        }

        return targetComponent || null;
    }

    /**
     * Get pattern-aware next lane for rhythm mode
     * Returns a lane index (1-8) based on patterns, or null for random
     */
    getPatternAwareLane(prevLane) {
        if (!prevLane || this.commonPatterns.length === 0) {
            return null;
        }

        // Get the weapon
        const prevWeapon = this.weaponSlots[prevLane];
        if (!prevWeapon) {
            return null;
        }

        // Check for patterns starting with this weapon (either Q or E)
        const matchingPatterns = this.commonPatterns.filter(p =>
            p.from &&
            p.to &&
            p.from.weapon === prevWeapon
        );

        if (matchingPatterns.length === 0) {
            return null;
        }

        // Check likelihood
        if (Math.random() * 100 >= this.patternLikelihood) {
            return null;
        }

        // Randomly select a matching pattern
        const selectedPattern = matchingPatterns[Math.floor(Math.random() * matchingPatterns.length)];
        const targetWeapon = selectedPattern.to.weapon;

        // Find the lane with this weapon
        for (let lane = 1; lane <= 8; lane++) {
            if (this.weaponSlots[lane] === targetWeapon) {
                return lane;
            }
        }

        return null;
    }

    /**
     * Get common patterns
     */
    getCommonPatterns() {
        return this.commonPatterns;
    }

    /**
     * Set common patterns
     */
    setCommonPatterns(patterns) {
        this.commonPatterns = patterns;
        StorageManager.saveCommonPatterns(patterns);
    }

    /**
     * Get pattern likelihood
     */
    getPatternLikelihood() {
        return this.patternLikelihood;
    }

    /**
     * Set pattern likelihood
     */
    setPatternLikelihood(likelihood) {
        this.patternLikelihood = Math.max(0, Math.min(100, likelihood));
        StorageManager.savePatternLikelihood(this.patternLikelihood);
    }

    /**
     * Add a new pattern
     */
    addPattern() {
        this.commonPatterns.push({ from: null, to: null });
        StorageManager.saveCommonPatterns(this.commonPatterns);
    }

    /**
     * Update a pattern field
     * @param {number} index - Pattern index
     * @param {string} field - 'from' or 'to'
     * @param {object} value - { weapon, skill } object or null
     */
    updatePattern(index, field, value) {
        if (index >= 0 && index < this.commonPatterns.length) {
            this.commonPatterns[index][field] = value;
            StorageManager.saveCommonPatterns(this.commonPatterns);
        }
    }

    /**
     * Parse skill string to object (for UI compatibility)
     */
    parseSkillString(str) {
        if (!str) return null;
        const lastDash = str.lastIndexOf('-');
        if (lastDash === -1) return null;
        return {
            weapon: str.substring(0, lastDash),
            skill: str.substring(lastDash + 1)
        };
    }

    /**
     * Format skill object to string (for UI display)
     */
    formatSkillObject(obj) {
        if (!obj || !obj.weapon || !obj.skill) return '';
        return `${obj.weapon}-${obj.skill}`;
    }

    /**
     * Remove a pattern
     */
    removePattern(index) {
        if (index >= 0 && index < this.commonPatterns.length) {
            this.commonPatterns.splice(index, 1);
            StorageManager.saveCommonPatterns(this.commonPatterns);
        }
    }

    /**
     * Save weapon slots to storage
     */
    save() {
        StorageManager.saveWeaponSlots(this.weaponSlots);
    }

    /**
     * Save slot keybindings to storage
     */
    saveKeybindings() {
        StorageManager.saveSlotKeybindings(this.slotKeybindings);
    }
}
