/**
 * Component Manager - Handles component operations
 */

class ComponentManager {
    constructor() {
        this.components = StorageManager.loadComponents();
    }

    /**
     * Get all components
     */
    getAll() {
        return this.components;
    }

    /**
     * Add a new component
     */
    add(key, description) {
        if (!key || !description) {
            throw new Error('Key and description are required');
        }

        if (this.exists(key)) {
            throw new Error('A component with this key already exists');
        }

        this.components.push({ key, description });
        this.save();
    }

    /**
     * Delete a component by index
     */
    delete(index) {
        if (index < 0 || index >= this.components.length) {
            throw new Error('Invalid component index');
        }

        this.components.splice(index, 1);
        this.save();
    }

    /**
     * Check if a component with the given key exists
     */
    exists(key) {
        return this.components.some(c => c.key === key);
    }

    /**
     * Import components from array
     */
    import(componentsArray) {
        if (!Array.isArray(componentsArray)) {
            throw new Error('Invalid format: JSON must be an array of components');
        }

        const valid = componentsArray.every(c => c.key && c.description);
        if (!valid) {
            throw new Error('Invalid format: Each component must have "key" and "description"');
        }

        this.components = [...componentsArray];
        this.save();
    }

    /**
     * Export components as JSON string
     */
    export() {
        return JSON.stringify(this.components, null, 2);
    }

    /**
     * Find component by key
     */
    findByKey(key) {
        return this.components.find(c => c.key === key);
    }

    /**
     * Get component count
     */
    count() {
        return this.components.length;
    }

    /**
     * Generate random round of components
     */
    generateRound(size) {
        if (this.components.length === 0) {
            throw new Error('No components configured');
        }

        const round = [];
        const availableComponents = [...this.components];

        for (let i = 0; i < size; i++) {
            const randomIndex = Math.floor(Math.random() * availableComponents.length);
            round.push(availableComponents[randomIndex]);
            availableComponents.splice(randomIndex, 1);

            if (availableComponents.length === 0) {
                availableComponents.push(...this.components);
            }
        }

        return round;
    }

    /**
     * Save components to storage
     */
    save() {
        StorageManager.saveComponents(this.components);
    }
}
