/**
 * Main Application Controller
 */

class TrainingApp {
    constructor() {
        this.componentManager = new ComponentManager();
        this.statisticsManager = new StatisticsManager();
        this.ui = new UIManager();
        this.weaponSelectController = null; // Initialized after componentManager

        this.state = {
            // Round settings (loaded from storage)
            roundSize: CONFIG.ROUND_SIZE.DEFAULT,

            // Pressure mode settings
            pressureModeEnabled: false,
            pressureDrainRate: CONFIG.PRESSURE_MODE.DEFAULT_DRAIN_RATE,
            pressureBar: 100,
            isPressureWarning: false,
            isPressureCritical: false,

            // Training state
            currentRound: [],
            currentComponentIndex: 0,
            currentKeyIndex: 0,
            componentErrors: 0,
            roundResults: [],
            isTraining: false,
            startTime: null,

            // Mode tracking
            lastModeWasWeaponSelect: false
        };

        this.timers = {
            countdown: null,
            component: null,
            pressureDrain: null
        };

        // Cleanup functions for event listeners
        this.cleanupFunctions = [];
    }

    /**
     * Initialize the application
     */
    async init() {
        await this.componentManager.init();

        // Initialize weapon select controller with dependencies
        this.weaponSelectController = new WeaponSelectModeController(
            this.componentManager,
            this.ui,
            CONFIG
        );
        this.weaponSelectController.loadSettings();

        // Load settings from storage
        this.loadSettings();

        // Sync UI with state
        this.syncUIWithState();

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Load all settings from storage
     */
    loadSettings() {
        this.state.roundSize = StorageManager.loadRoundSize();
        this.state.pressureModeEnabled = StorageManager.loadPressureModeEnabled();
        this.state.pressureDrainRate = StorageManager.loadPressureDrainRate();
    }

    /**
     * Sync UI elements with current state
     */
    syncUIWithState() {
        this.ui.setRoundSize(this.state.roundSize);
        this.ui.setFakeAttacksSettings(
            this.componentManager.fakeAttacksEnabled,
            this.componentManager.cancelKey
        );
        this.ui.setPressureModeSettings(
            this.state.pressureModeEnabled,
            this.state.pressureDrainRate
        );
        this.ui.setWeaponSelectSettings(
            this.weaponSelectController.state.speed,
            this.weaponSelectController.state.duration
        );
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Button events
        this.ui.elements.startButton.addEventListener('click', () => this.startRound());
        this.ui.elements.stopButton.addEventListener('click', () => this.stopRound());
        this.ui.elements.newRoundButton.addEventListener('click', () => this.handleNewRound());
        this.ui.elements.resetButton.addEventListener('click', () => this.resetPBs());
        this.ui.elements.viewPBsBtn.addEventListener('click', () => this.showPBModal());
        this.ui.elements.configBtn.addEventListener('click', () => this.showConfigModal());

        // Modal close events
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closePBModal());
        document.getElementById('closeConfigBtnX').addEventListener('click', () => this.closeConfigModal());

        this.ui.elements.pbModal.addEventListener('click', (e) => {
            if (e.target === this.ui.elements.pbModal) this.closePBModal();
        });

        this.ui.elements.configModal.addEventListener('click', (e) => {
            if (e.target === this.ui.elements.configModal) this.closeConfigModal();
        });

        // Common Patterns modal events
        this.ui.elements.commonPatternsBtn.addEventListener('click', () => this.showPatternsModal());
        this.ui.elements.closePatternsBtn.addEventListener('click', () => this.closePatternsModal());
        this.ui.elements.addPatternBtn.addEventListener('click', () => this.addPattern());

        this.ui.elements.patternsModal.addEventListener('click', (e) => {
            if (e.target === this.ui.elements.patternsModal) this.closePatternsModal();
        });

        this.ui.elements.patternLikelihoodInput.addEventListener('blur', (e) => {
            let value = parseInt(e.target.value, 10);
            if (isNaN(value)) {
                value = CONFIG.COMMON_PATTERNS.DEFAULT_LIKELIHOOD;
            }
            value = Math.max(0, Math.min(100, value));
            e.target.value = value;
            this.componentManager.setPatternLikelihood(value);
        });

        // Settings inputs
        this.ui.elements.roundSizeInput.addEventListener('input', (e) => this.handleRoundSizeInput(e));
        this.ui.elements.roundSizeInput.addEventListener('blur', (e) => this.handleRoundSizeBlur(e));

        // Fake attacks settings
        this.ui.elements.fakeAttacksCheckbox.addEventListener('change', (e) => {
            this.handleFakeAttacksToggle(e.target.checked);
        });

        // Setup cancel key capture using KeyCapture utility
        const cancelKeyCleanup = KeyCapture.setupInput(
            this.ui.elements.cancelKeyInput,
            (key) => this.handleCancelKeyChange(key),
            (error) => {
                alert(error.message);
                this.ui.elements.cancelKeyInput.value = this.componentManager.cancelKey;
            }
        );
        this.cleanupFunctions.push(cancelKeyCleanup);

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
            value = Math.max(CONFIG.PRESSURE_MODE.MIN_DRAIN_RATE,
                Math.min(CONFIG.PRESSURE_MODE.MAX_DRAIN_RATE, value));
            e.target.value = value.toFixed(1);
            this.state.pressureDrainRate = value;
            StorageManager.savePressureDrainRate(value);
        });

        // Weapon select mode events
        this.ui.elements.weaponSelectModeButton.addEventListener('click', () => this.startWeaponSelectMode());
        this.ui.elements.stopWeaponSelectButton.addEventListener('click', () => this.stopWeaponSelectMode());

        this.ui.elements.weaponSelectSpeedSelect.addEventListener('change', (e) => {
            this.weaponSelectController.saveSettings(e.target.value, undefined);
        });

        this.ui.elements.weaponSelectDurationSelect.addEventListener('change', (e) => {
            this.weaponSelectController.saveSettings(undefined, parseInt(e.target.value, 10));
        });

        // Global input events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('contextmenu', (e) => {
            if (this.state.isTraining || this.weaponSelectController.isActive()) {
                e.preventDefault();
            }
        });
    }

    // ==================== Fake Attacks Handling ====================

    /**
     * Handle fake attacks checkbox toggle
     */
    handleFakeAttacksToggle(enabled) {
        try {
            this.componentManager.setFakeAttacksConfig(enabled, this.componentManager.cancelKey);
            StorageManager.saveFakeAttacksEnabled(enabled);
        } catch (error) {
            alert(error.message);
            this.ui.elements.fakeAttacksCheckbox.checked = !enabled;
        }
    }

    /**
     * Handle cancel key change
     */
    handleCancelKeyChange(key) {
        this.componentManager.setFakeAttacksConfig(
            this.componentManager.fakeAttacksEnabled,
            key
        );
        StorageManager.saveFakeAttacksCancelKey(key);
    }

    // ==================== Training Mode ====================

    /**
     * Start a new training round
     */
    startRound() {
        try {
            this.state.roundSize = this.ui.getRoundSize();

            if (this.state.roundSize < CONFIG.ROUND_SIZE.MIN ||
                this.state.roundSize > CONFIG.ROUND_SIZE.MAX) {
                alert(`Round size must be between ${CONFIG.ROUND_SIZE.MIN} and ${CONFIG.ROUND_SIZE.MAX}`);
                return;
            }

            StorageManager.saveRoundSize(this.state.roundSize);

            this.state.currentRound = this.componentManager.generateRound(this.state.roundSize);
            this.state.currentComponentIndex = 0;
            this.state.roundResults = [];

            // Initialize pressure mode
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
        this.state.lastModeWasWeaponSelect = false;
        this.clearTimer('pressureDrain');
        this.ui.showScreen(SCREENS.RESULTS);
        this.ui.toggleTrainingButtons(false);
        this.ui.showTimesSidebar(false);
        this.ui.hidePressureBar();

        const stats = this.statisticsManager.calculateRoundStats(this.state.roundResults);
        this.ui.showResults(this.state.roundResults, stats, this.state.roundSize);
    }

    // ==================== Pressure Mode ====================

    /**
     * Start pressure drain timer
     */
    startPressureDrain() {
        const drainPerTick = this.state.pressureDrainRate / 20;

        this.timers.pressureDrain = setInterval(() => {
            this.state.pressureBar = Math.max(0, this.state.pressureBar - drainPerTick);
            this.ui.updatePressureBar(this.state.pressureBar);

            if (this.state.pressureBar <= CONFIG.PRESSURE_MODE.CRITICAL_THRESHOLD &&
                !this.state.isPressureCritical) {
                this.state.isPressureCritical = true;
                this.ui.setPressureBarCritical();
            } else if (this.state.pressureBar <= CONFIG.PRESSURE_MODE.WARNING_THRESHOLD &&
                !this.state.isPressureWarning) {
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

        this.state.pressureBar = Math.min(100,
            this.state.pressureBar + CONFIG.PRESSURE_MODE.SUCCESS_BOOST);

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

        this.state.pressureBar = Math.max(0,
            this.state.pressureBar - CONFIG.PRESSURE_MODE.ERROR_PENALTY);
        this.ui.updatePressureBar(this.state.pressureBar);

        if (this.state.pressureBar <= 0) {
            this.handlePressureGameOver();
        }
    }

    // ==================== Input Handling ====================

    /**
     * Handle keyboard input
     */
    handleKeyDown(e) {
        // Prevent default for special keys when not in input
        const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isInput) {
            const preventKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8',
                'F9', 'F10', 'F11', 'F12', 'Backspace', ' '];
            if (preventKeys.includes(e.key)) {
                e.preventDefault();
            }
        }

        // Escape handling
        if (e.key === 'Escape') {
            if (this.ui.elements.pbModal.style.display === 'flex') {
                this.closePBModal();
            } else if (this.ui.elements.configModal.style.display === 'flex') {
                this.closeConfigModal();
            } else if (this.ui.elements.patternsModal.style.display === 'flex') {
                this.closePatternsModal();
            } else if (this.weaponSelectController.isActive()) {
                this.stopWeaponSelectMode();
            }
            return;
        }

        // Weapon select mode input
        if (this.weaponSelectController.isActive()) {
            e.preventDefault();
            const key = KeyCapture.getKeyName(e);
            if (key) {
                this.weaponSelectController.processInput(key);
            }
            return;
        }

        // Training mode input
        if (!this.state.isTraining) return;

        e.preventDefault();
        const key = KeyCapture.getKeyName(e);
        if (key) {
            this.processKeyInput(key);
        }
    }

    /**
     * Handle mouse input
     */
    handleMouseDown(e) {
        // Prevent browser back/forward navigation
        if (e.button === 3 || e.button === 4) {
            e.preventDefault();
        }

        // Don't process clicks on UI elements
        const target = e.target;
        if (target.tagName === 'BUTTON' ||
            target.tagName === 'INPUT' ||
            target.closest('button') ||
            target.closest('.modal') ||
            target.closest('.settings-button')) {
            return;
        }

        // Weapon select mode mouse input
        if (this.weaponSelectController.isActive()) {
            e.preventDefault();
            const buttonName = KeyCapture.getMouseButtonName(e);
            this.weaponSelectController.processInput(buttonName);
            return;
        }

        // Training mode mouse input
        if (!this.state.isTraining) return;
        e.preventDefault();
        const buttonName = KeyCapture.getMouseButtonName(e);
        this.processKeyInput(buttonName);
    }

    /**
     * Process key/mouse input for training
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
            if (this.state.pressureModeEnabled) {
                this.penalizePressureBar();
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

    // ==================== Weapon Select Mode ====================

    /**
     * Start weapon select mode
     */
    startWeaponSelectMode() {
        this.weaponSelectController.start((stats) => {
            this.state.lastModeWasWeaponSelect = true;
            this.ui.showScreen(SCREENS.RESULTS);
        });

        this.ui.showScreen(SCREENS.COUNTDOWN);
        this.startWeaponSelectCountdown();
    }

    /**
     * Start weapon select countdown
     */
    startWeaponSelectCountdown() {
        let count = CONFIG.COUNTDOWN_START;
        this.ui.updateCountdown(count);

        this.timers.countdown = setInterval(() => {
            count--;
            if (count > 0) {
                this.ui.updateCountdown(count);
            } else {
                this.clearTimer('countdown');
                this.ui.showScreen(SCREENS.WEAPON_SELECT);
                this.weaponSelectController.beginGame();
            }
        }, CONFIG.COUNTDOWN_INTERVAL);
    }

    /**
     * Stop weapon select mode
     */
    stopWeaponSelectMode() {
        this.clearTimer('countdown');
        this.weaponSelectController.stop();

        if (!this.weaponSelectController.state.hits && !this.weaponSelectController.state.misses) {
            this.ui.showScreen(SCREENS.WELCOME);
        }
    }

    // ==================== Modal Handlers ====================

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
     * Show patterns modal
     */
    showPatternsModal() {
        this.renderPatterns();
        this.ui.setPatternLikelihood(this.componentManager.getPatternLikelihood());
        this.ui.showModal(this.ui.elements.patternsModal, true);
    }

    /**
     * Close patterns modal
     */
    closePatternsModal() {
        this.ui.showModal(this.ui.elements.patternsModal, false);
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
            (slot, weaponName) => this.handleWeaponSlotChange(slot, weaponName),
            (slot, key) => this.handleSlotKeybindingChange(slot, key)
        );
    }

    /**
     * Render patterns list
     */
    renderPatterns() {
        const patterns = this.componentManager.getCommonPatterns();
        const weaponSlots = this.componentManager.getWeaponSlots();
        this.ui.renderPatterns(
            patterns,
            weaponSlots,
            (index, field, value) => this.handlePatternChange(index, field, value),
            (index) => this.handlePatternRemove(index)
        );
    }

    /**
     * Handle pattern change
     */
    handlePatternChange(index, field, value) {
        this.componentManager.updatePattern(index, field, value);
    }

    /**
     * Handle pattern removal
     */
    handlePatternRemove(index) {
        this.componentManager.removePattern(index);
        this.renderPatterns();
    }

    /**
     * Add new pattern
     */
    addPattern() {
        this.componentManager.addPattern();
        this.renderPatterns();
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

    // ==================== Settings Handlers ====================

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
     * Handle new round button click
     */
    handleNewRound() {
        if (this.state.lastModeWasWeaponSelect) {
            this.state.lastModeWasWeaponSelect = false;
            this.ui.resetResultsScreen();
            this.ui.showScreen(SCREENS.WELCOME);
        } else {
            this.startRound();
        }
    }

    // ==================== Utilities ====================

    /**
     * Clear a timer
     */
    clearTimer(timerName) {
        if (this.timers[timerName]) {
            clearInterval(this.timers[timerName]);
            this.timers[timerName] = null;
        }
    }

    /**
     * Cleanup on destroy
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        Object.keys(this.timers).forEach(key => this.clearTimer(key));
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new TrainingApp();
    await app.init();
});
