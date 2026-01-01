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
            autoAdvance: StorageManager.loadAutoAdvance(),
            autoAdvanceDelay: StorageManager.loadAutoAdvanceDelay(),
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
            autoAdvance: null
        };
    }

    /**
     * Initialize the application
     */
    async init() {
        await this.componentManager.init();
        this.ui.setRoundSize(this.state.roundSize);
        this.ui.setAutoAdvanceSettings(this.state.autoAdvance, this.state.autoAdvanceDelay);
        this.setupEventListeners();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Button events
        this.ui.elements.startButton.addEventListener('click', () => this.startRound());
        this.ui.elements.stopButton.addEventListener('click', () => this.stopRound());
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

        this.ui.elements.autoAdvanceCheckbox.addEventListener('change', (e) => {
            this.state.autoAdvance = e.target.checked;
            StorageManager.saveAutoAdvance(this.state.autoAdvance);
        });

        this.ui.elements.autoAdvanceDelayInput.addEventListener('input', (e) => this.handleAutoDelayInput(e));
        this.ui.elements.autoAdvanceDelayInput.addEventListener('blur', (e) => this.handleAutoDelayBlur(e));

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
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

        if (this.state.autoAdvance) {
            this.timers.autoAdvance = setTimeout(() => {
                this.skipToNextComponent();
            }, this.state.autoAdvanceDelay * 1000);
        }

        this.timers.component = setInterval(() => {
            const elapsed = (Date.now() - this.state.startTime) / 1000;
            this.ui.updateTimer(elapsed);
        }, CONFIG.TIMER_UPDATE_INTERVAL);
    }

    /**
     * Complete current component
     */
    completeComponent() {
        if (!this.state.isTraining) return;

        this.clearTimer('autoAdvance');
        this.clearTimer('component');

        const completionTime = (Date.now() - this.state.startTime) / 1000;
        this.state.isTraining = false;

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
     * Skip to next component (auto-advance timeout)
     */
    skipToNextComponent() {
        if (!this.state.isTraining) return;

        this.clearTimer('component');
        this.state.isTraining = false;

        this.state.currentComponentIndex++;

        if (this.state.currentComponentIndex < this.state.currentRound.length) {
            setTimeout(() => this.startComponent(), CONFIG.SKIP_TRANSITION_DELAY);
        } else {
            setTimeout(() => this.showResults(), CONFIG.SKIP_TRANSITION_DELAY);
        }
    }

    /**
     * Stop current round
     */
    stopRound() {
        this.clearTimer('countdown');
        this.clearTimer('autoAdvance');

        if (this.state.isTraining) {
            this.clearTimer('component');
            this.state.isTraining = false;
        }

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

        const key = e.key === ' ' ? ' ' : e.key.toLowerCase();
        this.processKeyInput(key);
    }

    /**
     * Handle mouse input
     */
    handleMouseDown(e) {
        if (!this.state.isTraining) return;

        if (e.button === 0) {
            this.processKeyInput('LeftMouseButton');
        }
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
            this.state.componentErrors++;
            this.ui.flashKeyError(requiredKeys, () => {
                this.state.currentKeyIndex = 0;
                this.ui.updateKeyIndicators(requiredKeys, this.state.currentKeyIndex);
            }, this.state.currentKeyIndex);
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
        this.ui.renderWeaponSlots(weaponSlots, (slot, weaponName) => {
            this.handleWeaponSlotChange(slot, weaponName);
        });
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
     * Handle auto-advance delay input
     */
    handleAutoDelayInput(e) {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value >= CONFIG.AUTO_ADVANCE.MIN_DELAY && value <= CONFIG.AUTO_ADVANCE.MAX_DELAY) {
            this.state.autoAdvanceDelay = value;
            StorageManager.saveAutoAdvanceDelay(this.state.autoAdvanceDelay);
        }
    }

    /**
     * Handle auto-advance delay blur (validate)
     */
    handleAutoDelayBlur(e) {
        let value = parseFloat(e.target.value);

        if (isNaN(value) || e.target.value === '') {
            e.target.value = this.state.autoAdvanceDelay;
        } else if (value < CONFIG.AUTO_ADVANCE.MIN_DELAY) {
            value = CONFIG.AUTO_ADVANCE.MIN_DELAY;
            e.target.value = value;
            this.state.autoAdvanceDelay = value;
            StorageManager.saveAutoAdvanceDelay(value);
        } else if (value > CONFIG.AUTO_ADVANCE.MAX_DELAY) {
            value = CONFIG.AUTO_ADVANCE.MAX_DELAY;
            e.target.value = value;
            this.state.autoAdvanceDelay = value;
            StorageManager.saveAutoAdvanceDelay(value);
        }
    }

    /**
     * Clear a timer
     */
    clearTimer(timerName) {
        if (this.timers[timerName]) {
            if (timerName === 'autoAdvance') {
                clearTimeout(this.timers[timerName]);
            } else {
                clearInterval(this.timers[timerName]);
            }
            this.timers[timerName] = null;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new TrainingApp();
    await app.init();
});
