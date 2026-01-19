/**
 * Weapon Select Mode Controller - Handles all weapon select game logic
 */

class WeaponSelectModeController {
    constructor(componentManager, ui, config) {
        this.componentManager = componentManager;
        this.ui = ui;
        this.config = config;

        this.state = {
            isActive: false,
            notes: [],
            nextNoteId: 0,
            hits: 0,
            misses: 0,
            startTime: null,
            duration: config.WEAPON_SELECT_MODE.DEFAULT_DURATION,
            speed: config.WEAPON_SELECT_MODE.DEFAULT_NOTE_SPEED,
            hitLineRatio: 0.75,
            lastLane: null
        };

        this.timers = {
            spawn: null,
            update: null,
            timer: null
        };

        this.onComplete = null; // Callback when round ends
    }

    /**
     * Check if weapon select mode is active
     */
    isActive() {
        return this.state.isActive;
    }

    /**
     * Get current stats
     */
    getStats() {
        return {
            hits: this.state.hits,
            misses: this.state.misses,
            accuracy: this.calculateAccuracy()
        };
    }

    /**
     * Calculate current accuracy
     */
    calculateAccuracy() {
        const total = this.state.hits + this.state.misses;
        return total > 0 ? Math.round((this.state.hits / total) * 100) : 100;
    }

    /**
     * Load settings from storage
     */
    loadSettings() {
        this.state.speed = StorageManager.load(this.config.STORAGE_KEYS.WEAPON_SELECT_NOTE_SPEED)
            || this.config.WEAPON_SELECT_MODE.DEFAULT_NOTE_SPEED;
        this.state.duration = StorageManager.load(this.config.STORAGE_KEYS.WEAPON_SELECT_DURATION)
            || this.config.WEAPON_SELECT_MODE.DEFAULT_DURATION;
    }

    /**
     * Save settings to storage
     */
    saveSettings(speed, duration) {
        if (speed !== undefined) {
            this.state.speed = speed;
            StorageManager.save(this.config.STORAGE_KEYS.WEAPON_SELECT_NOTE_SPEED, speed);
        }
        if (duration !== undefined) {
            this.state.duration = duration;
            StorageManager.save(this.config.STORAGE_KEYS.WEAPON_SELECT_DURATION, duration);
        }
    }

    /**
     * Start weapon select mode
     */
    start(onComplete) {
        this.onComplete = onComplete;

        // Load current UI settings
        const settings = this.ui.getWeaponSelectSettings();
        this.state.speed = settings.speed;
        this.state.duration = settings.duration;

        // Reset state
        this.state.isActive = true;
        this.state.notes = [];
        this.state.nextNoteId = 0;
        this.state.hits = 0;
        this.state.misses = 0;
        this.state.lastLane = null;

        // Setup lanes
        const slotKeybindings = this.componentManager.getSlotKeybindings();
        const weaponSlots = this.componentManager.getWeaponSlots();
        this.ui.renderWeaponSelectLanes(slotKeybindings, weaponSlots);

        return true;
    }

    /**
     * Begin the game after countdown
     */
    beginGame() {
        this.state.startTime = Date.now();
        this.state.hitLineRatio = this.ui.calculateHitLineRatio();

        // Update initial stats
        this.ui.updateWeaponSelectStats(0, 0, 100);
        if (this.state.duration > 0) {
            this.ui.updateWeaponSelectTime(this.state.duration);
        } else {
            this.ui.updateWeaponSelectTime('∞');
        }

        // Start spawning notes
        const spawnRate = this.config.WEAPON_SELECT_MODE.SPAWN_RATES[this.state.speed]
            || this.config.WEAPON_SELECT_MODE.DEFAULT_SPAWN_RATE;
        this.timers.spawn = setInterval(() => this.spawnNote(), spawnRate);

        // Start update loop
        this.timers.update = setInterval(() => this.updateNotes(), 50);

        // Start timer if not endless
        if (this.state.duration > 0) {
            this.timers.timer = setInterval(() => this.updateTimer(), 1000);
        }

        // Spawn first note immediately
        this.spawnNote();
    }

    /**
     * Spawn a new note (pattern-aware)
     */
    spawnNote() {
        // Try pattern-aware lane selection
        let laneIndex = this.componentManager.getPatternAwareLane(this.state.lastLane);

        // Fall back to random
        if (!laneIndex) {
            laneIndex = Math.floor(Math.random() * this.config.WEAPON_SELECT_MODE.LANE_COUNT) + 1;
        }

        this.state.lastLane = laneIndex;

        const slotKeybindings = this.componentManager.getSlotKeybindings();
        const weaponSlots = this.componentManager.getWeaponSlots();
        const key = slotKeybindings[laneIndex] || laneIndex.toString();
        const weaponName = weaponSlots[laneIndex] || `Slot ${laneIndex}`;

        const noteId = this.state.nextNoteId++;
        const fallDuration = this.config.WEAPON_SELECT_MODE.NOTE_SPEEDS[this.state.speed]
            || this.config.WEAPON_SELECT_MODE.NOTE_SPEEDS.medium;

        const note = {
            id: noteId,
            lane: laneIndex,
            key: key,
            spawnTime: Date.now(),
            fallDuration: fallDuration,
            hit: false,
            missed: false
        };

        this.state.notes.push(note);
        this.ui.createNote(noteId, laneIndex, weaponName, fallDuration);
    }

    /**
     * Update notes (check for missed)
     */
    updateNotes() {
        const now = Date.now();
        const hitWindow = this.config.WEAPON_SELECT_MODE.HIT_WINDOW;
        const hitLineRatio = this.state.hitLineRatio;

        this.state.notes.forEach(note => {
            if (note.hit || note.missed) return;

            const elapsed = now - note.spawnTime;
            const targetTime = note.fallDuration * hitLineRatio;

            if (elapsed > targetTime + hitWindow) {
                note.missed = true;
                this.state.misses++;
                this.ui.markNoteMiss(note.id);
                this.updateAccuracyDisplay();

                setTimeout(() => {
                    this.ui.removeNote(note.id);
                    this.state.notes = this.state.notes.filter(n => n.id !== note.id);
                }, 500);
            }
        });
    }

    /**
     * Update timer display
     */
    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
        const remaining = this.state.duration - elapsed;

        if (remaining <= 0) {
            this.endRound();
        } else {
            this.ui.updateWeaponSelectTime(remaining);
        }
    }

    /**
     * Process input key
     */
    processInput(inputKey) {
        const slotKeybindings = this.componentManager.getSlotKeybindings();
        const now = Date.now();
        const hitWindow = this.config.WEAPON_SELECT_MODE.HIT_WINDOW;
        const hitLineRatio = this.state.hitLineRatio;

        // Find target lane
        let targetLane = null;
        for (let slot = 1; slot <= this.config.WEAPON_SELECT_MODE.LANE_COUNT; slot++) {
            const slotKey = slotKeybindings[slot] || slot.toString();
            if (slotKey.toLowerCase() === inputKey.toLowerCase()) {
                targetLane = slot;
                break;
            }
        }

        if (!targetLane) return;

        // Find closest hittable note
        let closestNote = null;
        let closestDistance = Infinity;

        this.state.notes.forEach(note => {
            if (note.hit || note.missed || note.lane !== targetLane) return;

            const elapsed = now - note.spawnTime;
            const targetTime = note.fallDuration * hitLineRatio;
            const distance = Math.abs(elapsed - targetTime);

            if (distance <= hitWindow && distance < closestDistance) {
                closestDistance = distance;
                closestNote = note;
            }
        });

        if (closestNote) {
            closestNote.hit = true;
            this.state.hits++;
            this.ui.markNoteHit(closestNote.id);

            setTimeout(() => {
                this.state.notes = this.state.notes.filter(n => n.id !== closestNote.id);
            }, 200);
        } else {
            this.ui.flashLane(targetLane, 'miss');
        }

        this.updateAccuracyDisplay();
    }

    /**
     * Update accuracy display
     */
    updateAccuracyDisplay() {
        this.ui.updateWeaponSelectStats(this.state.hits, this.state.misses, this.calculateAccuracy());
    }

    /**
     * Stop weapon select mode (user initiated)
     */
    stop() {
        this.clearTimers();
        this.state.isActive = false;
        this.ui.clearWeaponSelectNotes();

        if (this.state.hits > 0 || this.state.misses > 0) {
            this.showResults();
        }
    }

    /**
     * End round naturally
     */
    endRound() {
        this.clearTimers();
        this.state.isActive = false;

        setTimeout(() => {
            this.ui.clearWeaponSelectNotes();
            this.showResults();
        }, 500);
    }

    /**
     * Show results
     */
    showResults() {
        const stats = this.getStats();
        this.ui.showWeaponSelectResults(stats.hits, stats.misses, stats.accuracy);

        if (this.onComplete) {
            this.onComplete(stats);
        }
    }

    /**
     * Clear all timers
     */
    clearTimers() {
        Object.keys(this.timers).forEach(key => {
            if (this.timers[key]) {
                clearInterval(this.timers[key]);
                this.timers[key] = null;
            }
        });
    }
}
