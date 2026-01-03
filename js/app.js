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
            fakeAttacksEnabled: StorageManager.loadFakeAttacksEnabled(),
            fakeAttacksCancelKey: StorageManager.loadFakeAttacksCancelKey(),
            trainingMode: StorageManager.loadTrainingMode(),
            decisionModeConfig: StorageManager.loadDecisionModeConfig(),
            currentRound: [],
            currentComponentIndex: 0,
            currentKeyIndex: 0,
            componentErrors: 0,
            roundResults: [],
            isTraining: false,
            startTime: null,
            currentComboIndex: 0,  // Track which combo in the list they're working on (decision mode)
            currentCombo: { weapons: [] }  // Track the actively built combo (decision mode)
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
        this.componentManager.setFakeAttacksConfig(this.state.fakeAttacksEnabled, this.state.fakeAttacksCancelKey);
        this.ui.setRoundSize(this.state.roundSize);
        this.ui.setAutoAdvanceSettings(this.state.autoAdvance, this.state.autoAdvanceDelay);
        this.ui.setFakeAttacksSettings(
            this.state.fakeAttacksEnabled,
            this.state.fakeAttacksCancelKey
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

        this.ui.elements.autoAdvanceCheckbox.addEventListener('change', (e) => {
            this.state.autoAdvance = e.target.checked;
            StorageManager.saveAutoAdvance(this.state.autoAdvance);
        });

        this.ui.elements.autoAdvanceDelayInput.addEventListener('input', (e) => this.handleAutoDelayInput(e));
        this.ui.elements.autoAdvanceDelayInput.addEventListener('blur', (e) => this.handleAutoDelayBlur(e));

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

        // Training mode radio buttons
        document.getElementById('classicModeRadio').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.state.trainingMode = CONFIG.TRAINING_MODES.CLASSIC;
                StorageManager.saveTrainingMode(this.state.trainingMode);
                this.updateModeVisibility();
            }
        });

        document.getElementById('decisionModeRadio').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.state.trainingMode = CONFIG.TRAINING_MODES.DECISION;
                StorageManager.saveTrainingMode(this.state.trainingMode);
                this.updateModeVisibility();
            }
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

            // Generate round based on mode
            if (this.state.trainingMode === CONFIG.TRAINING_MODES.DECISION) {
                this.state.currentRound = this.generateDecisionRound(this.state.roundSize);
            } else {
                this.state.currentRound = this.componentManager.generateRound(this.state.roundSize);
            }

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
     * Generate decision mode round
     */
    generateDecisionRound(size) {
        const round = [];

        for (let i = 0; i < size; i++) {
            const distance = DISTANCES[Math.floor(Math.random() * DISTANCES.length)];

            round.push({
                distance: distance,
                key: `decision-${distance}`,
                description: `${distance.charAt(0).toUpperCase() + distance.slice(1)}`,
                isDecisionMode: true
            });
        }

        return round;
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

        // Reset decision mode feedback if applicable
        if (component.isDecisionMode) {
            this.resetDecisionFeedback();
            this.state.currentCombo = { weapons: [] };
            this.state.currentComboIndex = 0;  // Reset to first combo
            this.showCurrentComboRequirement(component.distance);  // Show what to perform
        }

        // Update component display based on mode
        if (component.isDecisionMode) {
            this.ui.updateDecisionComponent(
                component.distance,
                this.state.currentComponentIndex,
                this.state.roundSize
            );
        } else {
            this.ui.updateComponent(
                component,
                this.state.currentComponentIndex,
                this.state.roundSize
            );
        }

        // Only show timer and PB in classic mode
        if (component.isDecisionMode) {
            // Hide timer and PB for decision mode
            document.getElementById('timer').style.display = 'none';
            document.getElementById('pbDisplay').style.display = 'none';
        } else {
            // Show and update timer and PB for classic mode
            document.getElementById('timer').style.display = '';
            document.getElementById('pbDisplay').style.display = '';

            const pb = this.statisticsManager.getPersonalBest(component.key);
            this.ui.updatePBDisplay(pb);
        }

        this.state.startTime = Date.now();
        this.state.isTraining = true;
        this.state.currentKeyIndex = 0;
        this.state.componentErrors = 0;

        // Only apply auto-advance in classic mode
        if (this.state.trainingMode === CONFIG.TRAINING_MODES.CLASSIC && this.state.autoAdvance) {
            this.timers.autoAdvance = setTimeout(() => {
                this.skipToNextComponent();
            }, this.state.autoAdvanceDelay * 1000);
        }

        // Only run timer in classic mode
        if (!component.isDecisionMode) {
            this.timers.component = setInterval(() => {
                const elapsed = (Date.now() - this.state.startTime) / 1000;
                this.ui.updateTimer(elapsed);
            }, CONFIG.TIMER_UPDATE_INTERVAL);
        }
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

        // Skip PB tracking for decision mode - it's about learning, not speed
        if (!component.isDecisionMode) {
            // Only track times and PBs for classic mode
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
        }

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
        // Decision mode doesn't track results, go straight to welcome
        if (this.state.trainingMode === CONFIG.TRAINING_MODES.DECISION) {
            this.ui.showScreen(SCREENS.WELCOME);
            this.ui.toggleTrainingButtons(false);
            this.ui.showTimesSidebar(false);
            return;
        }

        // Classic mode shows results
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

        // Handle decision mode
        if (component.isDecisionMode) {
            this.processDecisionInput(component, inputKey);
            return;
        }

        // Handle classic mode
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
            });
        }
    }

    /**
     * Process input for decision mode
     */
    processDecisionInput(component, inputKey) {
        // Get valid combos for this distance
        const validCombos = this.state.decisionModeConfig[component.distance] || [];

        if (validCombos.length === 0) {
            // No combos configured for this distance
            return;
        }

        const weaponSlots = this.componentManager.getWeaponSlots();
        const slotKeybindings = this.componentManager.getSlotKeybindings();

        if (this.state.currentKeyIndex === 0) {
            // First input - check if it's a weapon slot key
            let pressedWeapon = null;
            let pressedSlot = null;

            for (let slot = 1; slot <= 8; slot++) {
                const slotKey = slotKeybindings[slot] || slot.toString();
                if (slotKey.toLowerCase() === inputKey.toLowerCase()) {
                    pressedWeapon = weaponSlots[slot];
                    pressedSlot = slot;
                    break;
                }
            }

            if (pressedWeapon) {
                // Valid weapon slot pressed
                this.state.currentCombo.weapons.push({ weapon: pressedWeapon, skill: null });
                this.state.currentKeyIndex = 1;

                // Show weapon image immediately upon weapon selection
                const weapon1Image = WEAPON_IMAGES[pressedWeapon];
                const comboWeapon1Container = document.getElementById('comboWeapon1').parentElement;
                const comboWeapon1Img = document.getElementById('comboWeapon1');

                comboWeapon1Container.classList.add('filled');
                comboWeapon1Img.src = weapon1Image;
                comboWeapon1Img.classList.add('visible');
                comboWeapon1Container.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                comboWeapon1Container.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.3)';
            } else {
                // Invalid input
                this.state.componentErrors++;
            }
        } else if (this.state.currentKeyIndex === 1) {
            // Second input - check if it's Q or E
            const skill = inputKey.toUpperCase();
            if (skill === 'Q' || skill === 'E') {
                // Set the skill for the current weapon
                this.state.currentCombo.weapons[this.state.currentCombo.weapons.length - 1].skill = skill;

                // Check if this weapon+skill combination is valid (exists in at least one combo)
                const currentWeapon = this.state.currentCombo.weapons[0].weapon;
                const isValidStart = validCombos.some(combo =>
                    combo.weapon1 === currentWeapon && combo.skill1 === skill
                );

                const comboWeapon1Container = document.getElementById('comboWeapon1').parentElement;
                const comboWeapon1Img = document.getElementById('comboWeapon1');

                if (isValidStart) {
                    // Valid weapon+skill combo - show green border
                    comboWeapon1Container.style.borderColor = '#00ff88';
                    comboWeapon1Container.style.borderWidth = '3px';
                    comboWeapon1Container.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.6)';

                    // Show partial combo text
                    const partialText = `${currentWeapon} ${skill}`;
                    this.ui.elements.weaponName.textContent = partialText;
                    this.ui.elements.weaponName.style.fontSize = '1.1em';
                    this.ui.elements.weaponName.style.color = '#00d9ff';

                    // Move to next step
                    this.state.currentKeyIndex = 2;
                } else {
                    // Invalid weapon+skill combo - show red border and reset
                    this.state.componentErrors++;
                    comboWeapon1Container.style.borderColor = '#ff4444';
                    comboWeapon1Container.style.borderWidth = '3px';
                    comboWeapon1Container.style.boxShadow = '0 0 20px rgba(255, 68, 68, 0.6)';
                    comboWeapon1Img.style.animation = 'shake 0.3s';

                    setTimeout(() => {
                        this.resetComboPreview();
                        this.state.currentKeyIndex = 0;
                        this.state.currentCombo = { weapons: [] };
                    }, 600);
                }
            } else {
                // Invalid skill key
                this.state.componentErrors++;
                this.resetComboPreview();
                this.state.currentKeyIndex = 0;
                this.state.currentCombo = { weapons: [] };
            }
        } else if (this.state.currentKeyIndex === 2) {
            // Third input - check if it's Q/E (same weapon combo) or weapon slot
            const skill = inputKey.toUpperCase();

            if (skill === 'Q' || skill === 'E') {
                // Check if this is a valid same-weapon combo
                const firstWeapon = this.state.currentCombo.weapons[0];
                const isValidSameWeapon = validCombos.some(combo =>
                    combo.weapon1 === firstWeapon.weapon &&
                    combo.skill1 === firstWeapon.skill &&
                    combo.weapon2 === firstWeapon.weapon &&
                    combo.skill2 === skill
                );

                if (isValidSameWeapon) {
                    // Valid same-weapon combo - add second weapon entry with same weapon
                    this.state.currentCombo.weapons.push({ weapon: firstWeapon.weapon, skill: skill });

                    // Show arrow and second weapon image (same as first)
                    const weapon2Image = WEAPON_IMAGES[firstWeapon.weapon];
                    const comboArrow = document.getElementById('comboArrow');
                    const comboWeapon2Container = document.getElementById('comboWeapon2Container');
                    const comboWeapon2Img = document.getElementById('comboWeapon2');

                    comboArrow.classList.add('visible');
                    comboWeapon2Container.classList.add('filled');
                    comboWeapon2Img.src = weapon2Image;
                    comboWeapon2Img.classList.add('visible');
                    comboWeapon2Container.style.borderColor = '#00ff88';
                    comboWeapon2Container.style.borderWidth = '4px';
                    comboWeapon2Container.style.boxShadow = '0 0 30px rgba(0, 255, 136, 1), 0 0 10px rgba(0, 255, 136, 0.5)';

                    // Also update first weapon to show success
                    const comboWeapon1Container = document.getElementById('comboWeapon1').parentElement;
                    const comboWeapon1Img = document.getElementById('comboWeapon1');
                    comboWeapon1Container.style.borderColor = '#00ff88';
                    comboWeapon1Container.style.borderWidth = '4px';
                    comboWeapon1Container.style.boxShadow = '0 0 30px rgba(0, 255, 136, 1), 0 0 10px rgba(0, 255, 136, 0.5)';

                    // Add success animation
                    comboWeapon1Img.style.transform = 'scale(1.1)';
                    comboWeapon2Img.style.transform = 'scale(1.1)';

                    // Show full combo text
                    const comboText = `${firstWeapon.weapon} ${firstWeapon.skill} → ${firstWeapon.weapon} ${skill}`;
                    this.ui.elements.weaponName.textContent = comboText;
                    this.ui.elements.weaponName.style.fontSize = '1.1em';
                    this.ui.elements.weaponName.style.color = '#00ff88';
                    this.ui.elements.weaponName.style.textShadow = '0 0 15px rgba(0, 255, 136, 0.8)';

                    // Mark combo as completed and check if all are done
                    this.completeDecisionCombo(firstWeapon.weapon, firstWeapon.skill, firstWeapon.weapon, skill);
                } else {
                    // Invalid same-weapon combo - reset
                    this.state.componentErrors++;
                    this.resetComboPreview();
                    this.state.currentKeyIndex = 0;
                    this.state.currentCombo = { weapons: [] };
                }
            } else {
                // Check for weapon slot selection
                let pressedWeapon = null;

                for (let slot = 1; slot <= 8; slot++) {
                    const slotKey = slotKeybindings[slot] || slot.toString();
                    if (slotKey.toLowerCase() === inputKey.toLowerCase()) {
                        pressedWeapon = weaponSlots[slot];
                        break;
                    }
                }

                if (pressedWeapon) {
                    this.state.currentCombo.weapons.push({ weapon: pressedWeapon, skill: null });
                    this.state.currentKeyIndex = 3;

                    // Show arrow and second weapon image immediately upon weapon selection
                    const weapon2Image = WEAPON_IMAGES[pressedWeapon];
                    const comboArrow = document.getElementById('comboArrow');
                    const comboWeapon2Container = document.getElementById('comboWeapon2Container');
                    const comboWeapon2Img = document.getElementById('comboWeapon2');

                    comboArrow.classList.add('visible');
                    comboWeapon2Container.classList.add('filled');
                    comboWeapon2Img.src = weapon2Image;
                    comboWeapon2Img.classList.add('visible');
                    comboWeapon2Container.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    comboWeapon2Container.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.3)';

                    // Update text to show first part and arrow
                    const firstWeapon = this.state.currentCombo.weapons[0];
                    const partialText = `${firstWeapon.weapon} ${firstWeapon.skill} → ${pressedWeapon}`;
                    this.ui.elements.weaponName.textContent = partialText;
                    this.ui.elements.weaponName.style.fontSize = '1.1em';
                    this.ui.elements.weaponName.style.color = '#00d9ff';
                } else {
                    // Invalid weapon slot - reset
                    this.state.componentErrors++;
                    this.resetComboPreview();
                    this.state.currentKeyIndex = 0;
                    this.state.currentCombo = { weapons: [] };
                }
            }
        } else if (this.state.currentKeyIndex === 3) {
            // Fourth input - second skill (Q or E)
            const skill = inputKey.toUpperCase();
            if (skill === 'Q' || skill === 'E') {
                this.state.currentCombo.weapons[1].skill = skill;

                // Show thin green border on second weapon to confirm Q/E was pressed correctly
                const comboWeapon2Container = document.getElementById('comboWeapon2Container');
                const comboWeapon2Img = document.getElementById('comboWeapon2');
                comboWeapon2Container.style.borderColor = '#00ff88';
                comboWeapon2Container.style.borderWidth = '3px';
                comboWeapon2Container.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.6)';

                // Check if this full combo matches any configured combo
                const [first, second] = this.state.currentCombo.weapons;
                const isValid = validCombos.some(combo => {
                    return first.weapon === combo.weapon1 && first.skill === combo.skill1 &&
                           second.weapon === combo.weapon2 && second.skill === combo.skill2;
                });

                const comboWeapon1Container = document.getElementById('comboWeapon1').parentElement;
                const comboWeapon1Img = document.getElementById('comboWeapon1');

                if (isValid) {
                    // Valid combo - bright green glow!
                    comboWeapon1Container.style.borderColor = '#00ff88';
                    comboWeapon1Container.style.borderWidth = '4px';
                    comboWeapon1Container.style.boxShadow = '0 0 30px rgba(0, 255, 136, 1), 0 0 10px rgba(0, 255, 136, 0.5)';
                    comboWeapon2Container.style.borderColor = '#00ff88';
                    comboWeapon2Container.style.borderWidth = '4px';
                    comboWeapon2Container.style.boxShadow = '0 0 30px rgba(0, 255, 136, 1), 0 0 10px rgba(0, 255, 136, 0.5)';

                    // Add success animation
                    comboWeapon1Img.style.transform = 'scale(1.1)';
                    comboWeapon2Img.style.transform = 'scale(1.1)';

                    // Show combo text (container already visible, just fill it)
                    const comboText = `${first.weapon} ${first.skill} → ${second.weapon} ${second.skill}`;
                    this.ui.elements.weaponName.textContent = comboText;
                    this.ui.elements.weaponName.style.fontSize = '1.1em';
                    this.ui.elements.weaponName.style.color = '#00ff88';
                    this.ui.elements.weaponName.style.textShadow = '0 0 15px rgba(0, 255, 136, 0.8)';

                    // Mark combo as completed and check if all are done
                    this.completeDecisionCombo(first.weapon, first.skill, second.weapon, second.skill);
                } else {
                    // Invalid combo - red glow!
                    this.state.componentErrors++;
                    comboWeapon1Container.style.borderColor = '#ff4444';
                    comboWeapon1Container.style.borderWidth = '4px';
                    comboWeapon1Container.style.boxShadow = '0 0 30px rgba(255, 68, 68, 1), 0 0 10px rgba(255, 68, 68, 0.5)';
                    comboWeapon2Container.style.borderColor = '#ff4444';
                    comboWeapon2Container.style.borderWidth = '4px';
                    comboWeapon2Container.style.boxShadow = '0 0 30px rgba(255, 68, 68, 1), 0 0 10px rgba(255, 68, 68, 0.5)';

                    // Add error shake animation
                    comboWeapon1Img.style.animation = 'shake 0.3s';
                    comboWeapon2Img.style.animation = 'shake 0.3s';

                    setTimeout(() => {
                        this.resetComboPreview();
                        this.state.currentKeyIndex = 0;
                        this.state.currentCombo = { weapons: [] };
                    }, 600);
                }
            } else {
                // Invalid skill
                this.state.componentErrors++;
                this.resetComboPreview();
                this.state.currentKeyIndex = 0;
                this.state.currentCombo = { weapons: [] };
            }
        }
    }

    /**
     * Show current combo requirement for decision mode
     */
    showCurrentComboRequirement(distance) {
        const combos = this.state.decisionModeConfig[distance] || [];
        const comboRequirement = document.getElementById('comboRequirement');
        const comboRequirementText = document.getElementById('comboRequirementText');

        if (!comboRequirement || !comboRequirementText) return;

        if (this.state.currentComboIndex < combos.length) {
            const combo = combos[this.state.currentComboIndex];
            const comboText = `${combo.weapon1} ${combo.skill1} → ${combo.weapon2} ${combo.skill2}`;
            comboRequirementText.textContent = comboText;
            comboRequirement.style.display = 'block';

            // Update progress to show combo number
            const component = this.state.currentRound[this.state.currentComponentIndex];
            this.ui.elements.roundProgress.textContent = `Decision ${this.state.currentComponentIndex + 1} / ${this.state.roundSize} - Combo ${this.state.currentComboIndex + 1} / ${combos.length}`;
        }
    }

    /**
     * Complete a decision mode combo
     */
    completeDecisionCombo(weapon1, skill1, weapon2, skill2) {
        const component = this.state.currentRound[this.state.currentComponentIndex];
        const combos = this.state.decisionModeConfig[component.distance] || [];
        const requiredCombo = combos[this.state.currentComboIndex];

        // Check if this matches the required combo
        if (requiredCombo &&
            weapon1 === requiredCombo.weapon1 &&
            skill1 === requiredCombo.skill1 &&
            weapon2 === requiredCombo.weapon2 &&
            skill2 === requiredCombo.skill2) {

            // Correct combo! Move to next
            this.state.currentComboIndex++;

            // Check if all combos are done
            if (this.state.currentComboIndex >= combos.length) {
                // All combos done - advance to next decision
                setTimeout(() => {
                    this.completeComponent();
                }, 500);
            } else {
                // More combos to do - reset and show next
                setTimeout(() => {
                    this.resetComboPreview();
                    this.state.currentKeyIndex = 0;
                    this.state.currentCombo = { weapons: [] };
                    this.showCurrentComboRequirement(component.distance);
                }, 500);
            }
        } else {
            // Wrong combo - show error and reset
            this.state.componentErrors++;
            setTimeout(() => {
                this.resetComboPreview();
                this.state.currentKeyIndex = 0;
                this.state.currentCombo = { weapons: [] };
            }, 500);
        }
    }

    /**
     * Reset decision mode visual feedback
     */
    resetDecisionFeedback() {
        this.resetComboPreview();

        // Hide combo requirement
        const comboRequirement = document.getElementById('comboRequirement');
        if (comboRequirement) {
            comboRequirement.style.display = 'none';
        }
    }

    /**
     * Reset combo preview display
     */
    resetComboPreview() {
        const comboWeapon1 = document.getElementById('comboWeapon1');
        const comboWeapon2 = document.getElementById('comboWeapon2');
        const comboArrow = document.getElementById('comboArrow');
        const comboWeapon1Container = comboWeapon1 ? comboWeapon1.parentElement : null;
        const comboWeapon2Container = document.getElementById('comboWeapon2Container');

        if (comboWeapon1Container) {
            comboWeapon1Container.classList.remove('filled');
            comboWeapon1Container.style.borderColor = '';
            comboWeapon1Container.style.borderWidth = '';
            comboWeapon1Container.style.boxShadow = '';
        }

        if (comboWeapon1) {
            comboWeapon1.src = '';
            comboWeapon1.classList.remove('visible');
            comboWeapon1.style.transform = '';
            comboWeapon1.style.animation = '';
        }

        if (comboWeapon2Container) {
            comboWeapon2Container.classList.remove('filled');
            comboWeapon2Container.style.borderColor = '';
            comboWeapon2Container.style.borderWidth = '';
            comboWeapon2Container.style.boxShadow = '';
        }

        if (comboWeapon2) {
            comboWeapon2.src = '';
            comboWeapon2.classList.remove('visible');
            comboWeapon2.style.transform = '';
            comboWeapon2.style.animation = '';
        }

        if (comboArrow) {
            comboArrow.classList.remove('visible');
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
        try {
            this.renderWeaponSlots();
            this.renderDecisionModeConfig();
            this.updateModeUI();
            this.updateModeVisibility();
            this.ui.showModal(this.ui.elements.configModal, true);
        } catch (error) {
            console.error('Error showing config modal:', error);
            alert('Error opening configuration: ' + error.message);
        }
    }

    /**
     * Update mode UI (radio buttons)
     */
    updateModeUI() {
        const classicRadio = document.getElementById('classicModeRadio');
        const decisionRadio = document.getElementById('decisionModeRadio');

        if (this.state.trainingMode === CONFIG.TRAINING_MODES.DECISION) {
            decisionRadio.checked = true;
        } else {
            classicRadio.checked = true;
        }
    }

    /**
     * Update visibility of mode-specific sections
     */
    updateModeVisibility() {
        const decisionConfigSection = document.getElementById('decisionModeConfig');
        const weaponSlotsSection = document.getElementById('weaponSlotsSection');
        const classicModeOptions = document.getElementById('classicModeOptions');
        const decisionModeOptions = document.getElementById('decisionModeOptions');

        if (this.state.trainingMode === CONFIG.TRAINING_MODES.DECISION) {
            decisionConfigSection.style.display = 'block';
            weaponSlotsSection.style.display = 'none';
            classicModeOptions.style.display = 'none';
            decisionModeOptions.style.display = 'block';
        } else {
            decisionConfigSection.style.display = 'none';
            weaponSlotsSection.style.display = 'block';
            classicModeOptions.style.display = 'block';
            decisionModeOptions.style.display = 'none';
        }
    }

    /**
     * Render decision mode configuration
     */
    renderDecisionModeConfig() {
        try {
            // Ensure decisionModeConfig is properly initialized
            if (!this.state.decisionModeConfig) {
                this.state.decisionModeConfig = JSON.parse(JSON.stringify(DEFAULT_DECISION_CONFIG));
            }

            // Get list of configured weapons from weapon slots
            const weaponSlots = this.componentManager.getWeaponSlots();
            const configuredWeapons = [];

            for (let slot = 1; slot <= 8; slot++) {
                const weapon = weaponSlots[slot];
                if (weapon && !configuredWeapons.includes(weapon)) {
                    configuredWeapons.push(weapon);
                }
            }

            this.ui.renderDecisionModeConfig(
                this.state.decisionModeConfig,
                configuredWeapons,
                (distance, weapon1, skill1, weapon2, skill2) => {
                    this.handleComboAdd(distance, weapon1, skill1, weapon2, skill2);
                },
                (distance, index) => {
                    this.handleComboRemove(distance, index);
                }
            );
        } catch (error) {
            console.error('Error in renderDecisionModeConfig:', error);
            throw error;
        }
    }

    /**
     * Handle adding a combo to a distance
     */
    handleComboAdd(distance, weapon1, skill1, weapon2, skill2) {
        if (!this.state.decisionModeConfig[distance]) {
            this.state.decisionModeConfig[distance] = [];
        }

        // Check if combo already exists
        const exists = this.state.decisionModeConfig[distance].some(
            combo => combo.weapon1 === weapon1 && combo.skill1 === skill1 &&
                     combo.weapon2 === weapon2 && combo.skill2 === skill2
        );

        if (exists) {
            alert('This combo already exists for this distance');
            return;
        }

        this.state.decisionModeConfig[distance].push({ weapon1, skill1, weapon2, skill2 });
        StorageManager.saveDecisionModeConfig(this.state.decisionModeConfig);
        this.renderDecisionModeConfig();
    }

    /**
     * Handle removing a combo from a distance
     */
    handleComboRemove(distance, index) {
        this.state.decisionModeConfig[distance].splice(index, 1);
        StorageManager.saveDecisionModeConfig(this.state.decisionModeConfig);
        this.renderDecisionModeConfig();
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
