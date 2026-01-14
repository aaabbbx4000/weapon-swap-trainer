/**
 * Main Application Controller
 */

class TrainingApp {
    constructor() {
        this.componentManager = new ComponentManager();
        this.statisticsManager = new StatisticsManager();
        this.ui = new UIManager();

        this.state = {
            roundSize: StorageManager.loadRoundSize(),
            fakeAttacksEnabled: StorageManager.loadFakeAttacksEnabled(),
            fakeAttacksCancelKey: StorageManager.loadFakeAttacksCancelKey(),
            pressureModeEnabled: StorageManager.loadPressureModeEnabled(),
            pressureDrainRate: StorageManager.loadPressureDrainRate(),
            pressureBar: 100,
            isPressureWarning: false,
            isPressureCritical: false,
            currentRound: [],
            currentComponentIndex: 0,
            currentKeyIndex: 0,
            componentErrors: 0,
            roundResults: [],
            isTraining: false,
            startTime: null
        };

        this.timers = {
            countdown: null,
            component: null,
            pressureDrain: null
        };
    }

    /**
     * Initialize the application
     */
    async init() {
        await this.componentManager.init();
        this.componentManager.setFakeAttacksConfig(this.state.fakeAttacksEnabled, this.state.fakeAttacksCancelKey);
        this.ui.setRoundSize(this.state.roundSize);
        this.ui.setFakeAttacksSettings(
            this.state.fakeAttacksEnabled,
            this.state.fakeAttacksCancelKey
        );
        this.ui.setPressureModeSettings(
            this.state.pressureModeEnabled,
            this.state.pressureDrainRate
        );
        this.setupEventListeners();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Button events
        this.ui.elements.startButton.addEventListener('click', () => this.startRound());
        this.ui.elements.stopButton.addEventListener('click', () => this.stopRound());
        this.ui.elements.newRoundButton.addEventListener('click', () => this.startRound());
        this.ui.elements.resetButton.addEventListener('click', () => this.resetPBs());
        this.ui.elements.viewPBsBtn.addEventListener('click', () => this.showPBModal());
        this.ui.elements.configBtn.addEventListener('click', () => this.showConfigModal());

        // Modal events
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closePBModal());
        document.getElementById('closeConfigBtnX').addEventListener('click', () => this.closeConfigModal());

        this.ui.elements.pbModal.addEventListener('click', (e) => {
            if (e.target === this.ui.elements.pbModal) this.closePBModal();
        });

        this.ui.elements.configModal.addEventListener('click', (e) => {
            if (e.target === this.ui.elements.configModal) this.closeConfigModal();
        });

        // Settings inputs
        this.ui.elements.roundSizeInput.addEventListener('input', (e) => this.handleRoundSizeInput(e));
        this.ui.elements.roundSizeInput.addEventListener('blur', (e) => this.handleRoundSizeBlur(e));

        // Fake attacks settings
        this.ui.elements.fakeAttacksCheckbox.addEventListener('change', (e) => {
            try {
                this.state.fakeAttacksEnabled = e.target.checked;
                StorageManager.saveFakeAttacksEnabled(this.state.fakeAttacksEnabled);
                this.componentManager.setFakeAttacksConfig(this.state.fakeAttacksEnabled, this.state.fakeAttacksCancelKey);
            } catch (error) {
                alert(error.message);
                // Revert checkbox
                e.target.checked = !e.target.checked;
                this.state.fakeAttacksEnabled = e.target.checked;
            }
        });

        // Capture actual key press for cancel key
        this.ui.elements.cancelKeyInput.addEventListener('keydown', (e) => {
            e.preventDefault();
            const key = this.ui.getKeyName(e);
            if (key) {
                try {
                    this.state.fakeAttacksCancelKey = key;
                    StorageManager.saveFakeAttacksCancelKey(this.state.fakeAttacksCancelKey);
                    this.componentManager.setFakeAttacksConfig(this.state.fakeAttacksEnabled, this.state.fakeAttacksCancelKey);
                    e.target.value = key;
                } catch (error) {
                    alert(error.message);
                    // Revert to previous value
                    e.target.value = this.state.fakeAttacksCancelKey;
                }
            }
        });

        // Capture mouse button for cancel key (but not the initial click to focus)
        this.ui.elements.cancelKeyInput.addEventListener('mousedown', (e) => {
            if (!document.activeElement || document.activeElement !== this.ui.elements.cancelKeyInput) {
                // This is the initial click to focus - allow it
                return;
            }

            // Input is already focused - capture this as a binding
            e.preventDefault();
            const buttonName = this.ui.getMouseButtonName(e);
            try {
                this.state.fakeAttacksCancelKey = buttonName;
                StorageManager.saveFakeAttacksCancelKey(this.state.fakeAttacksCancelKey);
                this.componentManager.setFakeAttacksConfig(this.state.fakeAttacksEnabled, this.state.fakeAttacksCancelKey);
                e.target.value = buttonName;
                e.target.blur();
            } catch (error) {
                alert(error.message);
                // Revert to previous value
                e.target.value = this.state.fakeAttacksCancelKey;
            }
        });

        // Prevent context menu on cancel key input
        this.ui.elements.cancelKeyInput.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Pressure mode settings
        this.ui.elements.pressureModeCheckbox.addEventListener('change', (e) => {
            this.state.pressureModeEnabled = e.target.checked;
            StorageManager.savePressureModeEnabled(this.state.pressureModeEnabled);
        });

        this.ui.elements.pressureDrainRateInput.addEventListener('blur', (e) => {
            let value = parseFloat(e.target.value);
            if (isNaN(value)) {
                value = CONFIG.PRESSURE_MODE.DEFAULT_DRAIN_RATE;
            }
            value = Math.max(CONFIG.PRESSURE_MODE.MIN_DRAIN_RATE, Math.min(CONFIG.PRESSURE_MODE.MAX_DRAIN_RATE, value));
            e.target.value = value.toFixed(1);
            this.state.pressureDrainRate = value;
            StorageManager.savePressureDrainRate(value);
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));

        // Prevent context menu during training
        document.addEventListener('contextmenu', (e) => {
            if (this.state.isTraining) {
                e.preventDefault();
            }
        });
    }

    /**
     * Start a new training round
     */
    startRound() {
        try {
            this.state.roundSize = this.ui.getRoundSize();

            if (this.state.roundSize < CONFIG.ROUND_SIZE.MIN || this.state.roundSize > CONFIG.ROUND_SIZE.MAX) {
                alert(`Round size must be between ${CONFIG.ROUND_SIZE.MIN} and ${CONFIG.ROUND_SIZE.MAX}`);
                return;
            }

            StorageManager.saveRoundSize(this.state.roundSize);

            this.state.currentRound = this.componentManager.generateRound(this.state.roundSize);
            this.state.currentComponentIndex = 0;
            this.state.roundResults = [];

            // Initialize pressure mode if enabled
            if (this.state.pressureModeEnabled) {
                this.state.pressureBar = 100;
                this.state.isPressureWarning = false;
                this.state.isPressureCritical = false;
                this.startPressureDrain();
            }

            this.ui.showTimesSidebar(true);
            this.ui.showScreen(SCREENS.COUNTDOWN);
            this.ui.toggleTrainingButtons(true);

            this.startCountdown();

        } catch (error) {
            alert(error.message);
        }
    }

    /**
     * Start countdown
     */
    startCountdown() {
        let count = CONFIG.COUNTDOWN_START;
        this.ui.updateCountdown(count);

        this.timers.countdown = setInterval(() => {
            count--;
            if (count > 0) {
                this.ui.updateCountdown(count);
            } else {
                this.clearTimer('countdown');
                this.startComponent();
            }
        }, CONFIG.COUNTDOWN_INTERVAL);
    }

    /**
     * Start component training
     */
    startComponent() {
        this.ui.showScreen(SCREENS.TRAINING);

        const component = this.state.currentRound[this.state.currentComponentIndex];

        // Update component display
        this.ui.updateComponent(
            component,
            this.state.currentComponentIndex,
            this.state.roundSize
        );

        const pb = this.statisticsManager.getPersonalBest(component.key);
        this.ui.updatePBDisplay(pb);

        this.state.startTime = Date.now();
        this.state.isTraining = true;
        this.state.currentKeyIndex = 0;
        this.state.componentErrors = 0;

        this.timers.component = setInterval(() => {
            const elapsed = (Date.now() - this.state.startTime) / 1000;
            this.ui.updateTimer(elapsed);
        }, CONFIG.TIMER_UPDATE_INTERVAL);

        // Show pressure bar on first component
        if (this.state.pressureModeEnabled && this.state.currentComponentIndex === 0) {
            this.ui.showPressureBar();
        }
    }

    /**
     * Complete current component
     */
    completeComponent() {
        if (!this.state.isTraining) return;

        this.clearTimer('component');

        const completionTime = (Date.now() - this.state.startTime) / 1000;
        this.state.isTraining = false;

        // Reward success in pressure mode
        if (this.state.pressureModeEnabled) {
            this.boostPressureBar();
        }

        const component = this.state.currentRound[this.state.currentComponentIndex];
        const isNewPB = this.statisticsManager.updatePersonalBest(component.key, completionTime);

        if (isNewPB) {
            this.ui.showNewPB(completionTime);
        }

        this.state.roundResults.push({
            component: component.description,
            time: completionTime,
            isNewPB,
            errors: this.state.componentErrors
        });

        this.ui.addTimeToSidebar(
            component,
            completionTime,
            isNewPB,
            this.state.currentComponentIndex
        );

        this.state.currentComponentIndex++;

        if (this.state.currentComponentIndex < this.state.currentRound.length) {
            setTimeout(() => this.startComponent(), CONFIG.COMPONENT_TRANSITION_DELAY);
        } else {
            setTimeout(() => this.showResults(), CONFIG.COMPONENT_TRANSITION_DELAY);
        }
    }

    /**
     * Stop current round
     */
    stopRound() {
        this.clearTimer('countdown');
        this.clearTimer('pressureDrain');

        if (this.state.isTraining) {
            this.clearTimer('component');
            this.state.isTraining = false;
        }

        this.ui.hidePressureBar();
        this.ui.showTimesSidebar(false);

        if (this.state.roundResults.length > 0) {
            this.showResults();
        } else {
            this.ui.showScreen(SCREENS.WELCOME);
            this.ui.toggleTrainingButtons(false);
        }
    }

    /**
     * Show results screen
     */
    showResults() {
        this.ui.showScreen(SCREENS.RESULTS);
        this.ui.toggleTrainingButtons(false);
        this.ui.showTimesSidebar(false);

        const stats = this.statisticsManager.calculateRoundStats(this.state.roundResults);
        this.ui.showResults(this.state.roundResults, stats, this.state.roundSize);
    }

    /**
     * Start pressure drain timer
     */
    startPressureDrain() {
        const drainPerTick = this.state.pressureDrainRate / 20;

        this.timers.pressureDrain = setInterval(() => {
            this.state.pressureBar = Math.max(0, this.state.pressureBar - drainPerTick);
            this.ui.updatePressureBar(this.state.pressureBar);

            if (this.state.pressureBar <= CONFIG.PRESSURE_MODE.CRITICAL_THRESHOLD && !this.state.isPressureCritical) {
                this.state.isPressureCritical = true;
                this.ui.setPressureBarCritical();
            } else if (this.state.pressureBar <= CONFIG.PRESSURE_MODE.WARNING_THRESHOLD && !this.state.isPressureWarning) {
                this.state.isPressureWarning = true;
                this.ui.setPressureBarWarning();
            }

            if (this.state.pressureBar <= 0) {
                this.handlePressureGameOver();
            }
        }, 50);
    }

    /**
     * Handle pressure mode game over
     */
    handlePressureGameOver() {
        this.clearTimer('pressureDrain');
        this.state.isTraining = false;
        this.ui.showGameOverFlash();

        setTimeout(() => {
            this.showResults();
        }, 1000);
    }

    /**
     * Boost pressure bar on success
     */
    boostPressureBar() {
        if (!this.state.pressureModeEnabled) return;

        this.state.pressureBar = Math.min(100, this.state.pressureBar + CONFIG.PRESSURE_MODE.SUCCESS_BOOST);

        if (this.state.pressureBar > CONFIG.PRESSURE_MODE.WARNING_THRESHOLD) {
            this.state.isPressureWarning = false;
            this.state.isPressureCritical = false;
            this.ui.resetPressureBarState();
        } else if (this.state.pressureBar > CONFIG.PRESSURE_MODE.CRITICAL_THRESHOLD) {
            this.state.isPressureCritical = false;
            this.ui.setPressureBarWarning();
        }

        this.ui.updatePressureBar(this.state.pressureBar);
    }

    /**
     * Penalize pressure bar on error
     */
    penalizePressureBar() {
        if (!this.state.pressureModeEnabled) return;

        this.state.pressureBar = Math.max(0, this.state.pressureBar - CONFIG.PRESSURE_MODE.ERROR_PENALTY);
        this.ui.updatePressureBar(this.state.pressureBar);

        if (this.state.pressureBar <= 0) {
            this.handlePressureGameOver();
        }
    }

    /**
     * Handle keyboard input
     */
    handleKeyDown(e) {
        if (e.key === 'Escape') {
            if (this.ui.elements.pbModal.style.display === 'flex') {
                this.closePBModal();
            } else if (this.ui.elements.configModal.style.display === 'flex') {
                this.closeConfigModal();
            }
            return;
        }

        if (!this.state.isTraining) return;

        // Prevent default browser behavior for all keys during training
        e.preventDefault();

        // Use the same key naming as keybindings
        const key = this.ui.getKeyName(e);
        if (key) {
            this.processKeyInput(key);
        }
    }

    /**
     * Handle mouse input
     */
    handleMouseDown(e) {
        if (!this.state.isTraining) return;

        // Don't process clicks on UI buttons or interactive elements
        const target = e.target;
        if (target.tagName === 'BUTTON' ||
            target.tagName === 'INPUT' ||
            target.closest('button') ||
            target.closest('.modal') ||
            target.closest('.settings-button')) {
            return; // Let the UI handle this click normally
        }

        // Prevent default browser behavior during training (e.g., context menu)
        e.preventDefault();

        // Use the same mouse button naming as keybindings
        const buttonName = this.ui.getMouseButtonName(e);
        this.processKeyInput(buttonName);
    }

    /**
     * Process key/mouse input
     */
    processKeyInput(inputKey) {
        const component = this.state.currentRound[this.state.currentComponentIndex];
        const requiredKeys = this.ui.parseKeys(component.key);
        const expectedKey = requiredKeys[this.state.currentKeyIndex];

        if (expectedKey.toLowerCase() === inputKey.toLowerCase()) {
            this.state.currentKeyIndex++;
            this.ui.updateKeyIndicators(requiredKeys, this.state.currentKeyIndex);
            this.checkCompletion(requiredKeys);
        } else {
            // Handle error
            if (this.state.pressureModeEnabled) {
                this.penalizePressureBar();
                // Don't reset in pressure mode, let them continue
                return;
            } else {
                this.state.componentErrors++;
                this.ui.flashKeyError(requiredKeys, () => {
                    this.state.currentKeyIndex = 0;
                    this.ui.updateKeyIndicators(requiredKeys, this.state.currentKeyIndex);
                });
            }
        }
    }

    /**
     * Check if component is completed
     */
    checkCompletion(requiredKeys) {
        if (this.state.currentKeyIndex >= requiredKeys.length) {
            this.completeComponent();
        }
    }

    /**
     * Show PB modal
     */
    showPBModal() {
        const sortedPBs = this.statisticsManager.getAllSorted();
        this.ui.renderPBList(sortedPBs, this.componentManager);
        this.ui.showModal(this.ui.elements.pbModal, true);
    }

    /**
     * Close PB modal
     */
    closePBModal() {
        this.ui.showModal(this.ui.elements.pbModal, false);
    }

    /**
     * Show config modal
     */
    showConfigModal() {
        this.renderWeaponSlots();
        this.ui.showModal(this.ui.elements.configModal, true);
    }

    /**
     * Close config modal
     */
    closeConfigModal() {
        this.ui.showModal(this.ui.elements.configModal, false);
    }

    /**
     * Render weapon slots configuration
     */
    renderWeaponSlots() {
        const weaponSlots = this.componentManager.getWeaponSlots();
        const slotKeybindings = this.componentManager.getSlotKeybindings();
        this.ui.renderWeaponSlots(
            weaponSlots,
            slotKeybindings,
            (slot, weaponName) => {
                this.handleWeaponSlotChange(slot, weaponName);
            },
            (slot, key) => {
                this.handleSlotKeybindingChange(slot, key);
            }
        );
    }

    /**
     * Handle weapon slot change
     */
    handleWeaponSlotChange(slot, weaponName) {
        try {
            this.componentManager.setWeaponSlot(slot, weaponName);
        } catch (error) {
            alert(error.message);
            this.renderWeaponSlots();
        }
    }

    /**
     * Handle slot keybinding change
     */
    handleSlotKeybindingChange(slot, key) {
        try {
            if (key.length > 0) {
                this.componentManager.setSlotKeybinding(slot, key);
            }
        } catch (error) {
            alert(error.message);
            this.renderWeaponSlots();
        }
    }

    /**
     * Reset all personal bests
     */
    resetPBs() {
        if (confirm('Are you sure you want to reset all personal bests? This cannot be undone.')) {
            this.statisticsManager.resetAll();
            alert('All personal bests have been reset!');
        }
    }

    /**
     * Handle round size input
     */
    handleRoundSizeInput(e) {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= CONFIG.ROUND_SIZE.MIN && value <= CONFIG.ROUND_SIZE.MAX) {
            this.state.roundSize = value;
            StorageManager.saveRoundSize(this.state.roundSize);
        }
    }

    /**
     * Handle round size blur (validate)
     */
    handleRoundSizeBlur(e) {
        let value = parseInt(e.target.value, 10);

        if (isNaN(value) || e.target.value === '') {
            e.target.value = this.state.roundSize;
        } else if (value < CONFIG.ROUND_SIZE.MIN) {
            value = CONFIG.ROUND_SIZE.MIN;
            e.target.value = value;
            this.state.roundSize = value;
            StorageManager.saveRoundSize(value);
        } else if (value > CONFIG.ROUND_SIZE.MAX) {
            value = CONFIG.ROUND_SIZE.MAX;
            e.target.value = value;
            this.state.roundSize = value;
            StorageManager.saveRoundSize(value);
        }
    }

    /**
     * Clear a timer
     */
    clearTimer(timerName) {
        if (this.timers[timerName]) {
            clearInterval(this.timers[timerName]);
            this.timers[timerName] = null;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new TrainingApp();
    await app.init();
});
