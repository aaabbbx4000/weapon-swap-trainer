/**
 * UI Manager - Handles all DOM manipulation and rendering
 */

class UIManager {
    constructor() {
        this.elements = this.cacheElements();
        this.statLabels = null;
        this.cacheStatLabels();
    }

    /**
     * Cache all DOM elements for better performance
     */
    cacheElements() {
        return {
            // Screens
            welcomeScreen: document.getElementById(SCREENS.WELCOME),
            countdownScreen: document.getElementById(SCREENS.COUNTDOWN),
            trainingScreen: document.getElementById(SCREENS.TRAINING),
            resultsScreen: document.getElementById(SCREENS.RESULTS),

            // Buttons
            startButton: document.getElementById('startButton'),
            stopButton: document.getElementById('stopButton'),
            newRoundButton: document.getElementById('newRoundButton'),
            resetButton: document.getElementById('resetButton'),
            viewPBsBtn: document.getElementById('viewPBsBtn'),
            configBtn: document.getElementById('configBtn'),

            // Modals
            pbModal: document.getElementById('pbModal'),
            configModal: document.getElementById('configModal'),

            // Displays
            countdownNumber: document.getElementById('countdownNumber'),
            weaponName: document.getElementById('weaponName'),
            weaponImage: document.getElementById('weaponImage'),
            fakeOverlay: document.getElementById('fakeOverlay'),
            keyIndicators: document.getElementById('keyIndicators'),
            timer: document.getElementById('timer'),
            pbDisplay: document.getElementById('pbDisplay'),
            roundProgress: document.getElementById('roundProgress'),
            timesSidebar: document.getElementById('timesSidebar'),
            timesList: document.getElementById('timesList'),

            // Results
            avgTime: document.getElementById('avgTime'),
            fastestTime: document.getElementById('fastestTime'),
            slowestTime: document.getElementById('slowestTime'),
            newPBCount: document.getElementById('newPBCount'),
            resultsList: document.getElementById('resultsList'),
            resultsTitle: document.querySelector('.results-title'),

            // Config
            roundSizeInput: document.getElementById('roundSizeInput'),
            weaponSlotsList: document.getElementById('weaponSlotsList'),
            pbListContent: document.getElementById('pbListContent'),
            fakeAttacksCheckbox: document.getElementById('fakeAttacksCheckbox'),
            cancelKeyInput: document.getElementById('cancelKeyInput'),

            // Pressure Mode
            pressureBarContainer: document.getElementById('pressureBarContainer'),
            pressureBarFill: document.getElementById('pressureBarFill'),
            pressureBarText: document.getElementById('pressureBarText'),
            pressureModeCheckbox: document.getElementById('pressureModeCheckbox'),
            pressureDrainRateInput: document.getElementById('pressureDrainRateInput'),

            // Weapon Select Mode
            weaponSelectScreen: document.getElementById(SCREENS.WEAPON_SELECT),
            weaponSelectModeButton: document.getElementById('weaponSelectModeButton'),
            stopWeaponSelectButton: document.getElementById('stopWeaponSelectButton'),
            weaponSelectLanesContainer: document.getElementById('weaponSelectLanesContainer'),
            weaponSelectLanes: document.getElementById('weaponSelectLanes'),
            weaponSelectLaneLabels: document.getElementById('weaponSelectLaneLabels'),
            weaponSelectHitZone: document.getElementById('weaponSelectHitZone'),
            weaponSelectHits: document.getElementById('weaponSelectHits'),
            weaponSelectMisses: document.getElementById('weaponSelectMisses'),
            weaponSelectAccuracy: document.getElementById('weaponSelectAccuracy'),
            weaponSelectTime: document.getElementById('weaponSelectTime'),
            weaponSelectSpeedSelect: document.getElementById('weaponSelectSpeedSelect'),
            weaponSelectDurationSelect: document.getElementById('weaponSelectDurationSelect'),

            // Common Patterns
            patternsModal: document.getElementById('patternsModal'),
            commonPatternsBtn: document.getElementById('commonPatternsBtn'),
            closePatternsBtn: document.getElementById('closePatternsBtn'),
            patternsList: document.getElementById('patternsList'),
            patternLikelihoodInput: document.getElementById('patternLikelihoodInput'),
            addPatternBtn: document.getElementById('addPatternBtn')
        };
    }

    /**
     * Show specific screen and hide others
     */
    showScreen(screenId) {
        Object.values(SCREENS).forEach(screen => {
            document.getElementById(screen).classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }

    /**
     * Update countdown display
     */
    updateCountdown(count) {
        this.elements.countdownNumber.textContent = count;
    }

    /**
     * Update weapon display
     */
    updateComponent(component, currentIndex, totalCount) {
        // Update weapon name - add "Fake Attack" in yellow if it's a fake
        if (component.isFake) {
            this.elements.weaponName.innerHTML = `${component.weapon} <span style="color: #ffd700;">Fake Attack</span>`;
            this.elements.fakeOverlay.style.display = 'block';
        } else {
            this.elements.weaponName.textContent = component.weapon;
            this.elements.fakeOverlay.style.display = 'none';
        }

        // Update weapon skill image
        const skillKey = `${component.weapon}-${component.skill.toLowerCase()}`;
        const weaponImagePath = WEAPON_SKILL_IMAGES[skillKey];
        this.elements.weaponImage.src = weaponImagePath;
        this.elements.weaponImage.className = 'weapon-image';

        this.elements.roundProgress.textContent = `Skill ${currentIndex + 1} / ${totalCount}`;

        const requiredKeys = this.parseKeys(component.key);
        this.renderKeyIndicators(requiredKeys);
    }

    /**
     * Parse component keys
     */
    parseKeys(keyString) {
        return keyString.split(',').map(k => k.trim());
    }

    /**
     * Render key indicators for weapon skill (slot number + skill letter + optional cancel key)
     */
    renderKeyIndicators(requiredKeys) {
        // requiredKeys already includes the cancel key for fake attacks, so just render them all
        const keysHTML = requiredKeys.map(key => {
            const displayKey = this.getDisplayKey(key);
            const elementId = this.getKeyElementId(key);

            return `<span id="${elementId}" class="key-indicator skill-key">${displayKey}</span>`;
        }).join('');

        this.elements.keyIndicators.innerHTML = keysHTML;
    }

    /**
     * Get display text for a key
     */
    getDisplayKey(key) {
        return (KEY_MAPPINGS[key] || key.toUpperCase());
    }

    /**
     * Get element ID for a key
     */
    getKeyElementId(key) {
        return `key-${key.replace(' ', 'space')}`;
    }

    /**
     * Update key indicators based on progress (slot and skill)
     */
    updateKeyIndicators(requiredKeys, currentKeyIndex) {
        requiredKeys.forEach((key, index) => {
            const elementId = this.getKeyElementId(key);
            const element = document.getElementById(elementId);

            if (!element) return;

            if (index < currentKeyIndex) {
                element.className = 'key-indicator skill-key key-completed';
            } else {
                element.className = 'key-indicator skill-key';
            }
        });
    }

    /**
     * Flash error on key indicators
     */
    flashKeyError(requiredKeys, callback) {
        // Show error on key indicators
        requiredKeys.forEach(key => {
            const element = document.getElementById(this.getKeyElementId(key));
            if (element) {
                element.className = 'key-indicator skill-key key-error';
            }
        });

        setTimeout(() => {
            callback();
        }, CONFIG.ERROR_FLASH_DURATION);
    }

    /**
     * Update timer display
     */
    updateTimer(seconds) {
        this.elements.timer.textContent = `${seconds.toFixed(1)}s`;
    }

    /**
     * Update personal best display
     */
    updatePBDisplay(pb) {
        if (pb) {
            this.elements.pbDisplay.textContent = `PB: ${pb.toFixed(1)}s`;
            this.elements.pbDisplay.className = 'pb-display';
        } else {
            this.elements.pbDisplay.textContent = 'No PB yet';
            this.elements.pbDisplay.className = 'pb-display';
        }
    }

    /**
     * Show new personal best
     */
    showNewPB(time) {
        this.elements.pbDisplay.textContent = `NEW PB! ${time.toFixed(1)}s`;
        this.elements.pbDisplay.className = 'pb-display new-pb';
    }

    /**
     * Add time to sidebar
     */
    addTimeToSidebar(component, time, isNewPB, componentIndex) {
        const timeItem = document.createElement('div');
        timeItem.className = 'time-item';
        if (isNewPB) {
            timeItem.classList.add('time-item-pb');
        }

        timeItem.innerHTML = `
            <div class="time-item-desc">${componentIndex + 1}. ${component.description}</div>
            <div class="time-item-value">
                ${time.toFixed(1)}s ${isNewPB ? '★' : ''}
            </div>
        `;

        this.elements.timesList.appendChild(timeItem);
        this.elements.timesList.scrollTop = this.elements.timesList.scrollHeight;
    }

    /**
     * Show/hide times sidebar
     */
    showTimesSidebar(show) {
        this.elements.timesSidebar.style.display = show ? 'block' : 'none';
        if (!show) {
            this.elements.timesList.innerHTML = '';
        }
    }

    /**
     * Show results screen
     */
    showResults(results, stats, roundSize) {
        this.elements.avgTime.textContent = `${stats.average.toFixed(1)}s`;
        this.elements.fastestTime.textContent = `${stats.fastest.toFixed(1)}s`;
        this.elements.slowestTime.textContent = `${stats.slowest.toFixed(1)}s`;
        this.elements.newPBCount.textContent = stats.newPBCount;

        if (results.length < roundSize) {
            this.elements.resultsTitle.textContent = `Round Stopped (${results.length}/${roundSize} skills)`;
        } else {
            this.elements.resultsTitle.textContent = 'Round Complete!';
        }

        this.renderResultsList(results);
    }

    /**
     * Render results list - grouped by component with averages
     */
    renderResultsList(results) {
        this.elements.resultsList.innerHTML = '';

        // Group results by component name
        const grouped = {};
        results.forEach(result => {
            if (!grouped[result.component]) {
                grouped[result.component] = {
                    times: [],
                    totalErrors: 0,
                    hasNewPB: false
                };
            }
            grouped[result.component].times.push(result.time);
            grouped[result.component].totalErrors += result.errors;
            if (result.isNewPB) {
                grouped[result.component].hasNewPB = true;
            }
        });

        // Calculate averages and create summary objects
        const summaries = Object.entries(grouped).map(([component, data]) => {
            const avgTime = data.times.reduce((sum, t) => sum + t, 0) / data.times.length;
            return {
                component,
                avgTime,
                totalErrors: data.totalErrors,
                hasNewPB: data.hasNewPB,
                attempts: data.times.length
            };
        });

        // Sort by average time (slowest first)
        const sortedSummaries = summaries.sort((a, b) => b.avgTime - a.avgTime);

        // Render grouped results
        sortedSummaries.forEach((summary, index) => {
            const item = document.createElement('div');
            item.className = 'result-item';

            const errorDisplay = summary.totalErrors > 0
                ? ` <span class="error-count">×${summary.totalErrors}</span>`
                : '';

            const pbBadge = summary.hasNewPB ? ' ★ NEW PB' : '';
            const timeClass = summary.hasNewPB ? 'result-time-pb' : 'result-time';

            item.innerHTML = `
                <span>${index + 1}. ${summary.component}${errorDisplay}</span>
                <span class="${timeClass}">${summary.avgTime.toFixed(1)}s${pbBadge}</span>
            `;

            this.elements.resultsList.appendChild(item);
        });
    }

    /**
     * Show/hide start and stop buttons
     */
    toggleTrainingButtons(isTraining) {
        if (isTraining) {
            this.elements.startButton.classList.add('hidden');
            this.elements.stopButton.classList.remove('hidden');
            this.elements.startButton.disabled = true;
        } else {
            this.elements.startButton.classList.remove('hidden');
            this.elements.stopButton.classList.add('hidden');
            this.elements.startButton.disabled = false;
        }
    }

    /**
     * Show/hide modal
     */
    showModal(modalElement, show) {
        if (show) {
            modalElement.classList.remove('hidden');
            modalElement.style.display = 'flex';
        } else {
            modalElement.classList.add('hidden');
            modalElement.style.display = 'none';
        }
    }

    /**
     * Render personal bests list
     */
    renderPBList(sortedPBs, componentManager) {
        if (sortedPBs.length === 0) {
            this.elements.pbListContent.innerHTML =
                '<p class="empty-message">No personal bests yet. Start training!</p>';
            return;
        }

        this.elements.pbListContent.innerHTML = '';

        sortedPBs.forEach(([key, time]) => {
            const component = componentManager.findByKey(key);
            const item = document.createElement('div');
            item.className = 'pb-item';
            item.innerHTML = `
                <span>${component ? component.description : key}</span>
                <span class="pb-time">${time.toFixed(1)}s</span>
            `;
            this.elements.pbListContent.appendChild(item);
        });
    }

    /**
     * Render weapon slots configuration
     */
    renderWeaponSlots(weaponSlots, slotKeybindings, weaponChangeCallback, keybindingChangeCallback) {
        this.elements.weaponSlotsList.innerHTML = '';

        for (let slot = 1; slot <= 8; slot++) {
            const item = document.createElement('div');
            item.className = 'weapon-slot-item';

            const currentWeapon = weaponSlots[slot] || '';
            const currentKey = slotKeybindings[slot] || slot.toString();

            item.innerHTML = `
                <label class="weapon-slot-label">Slot ${slot}:</label>
                <input type="text" class="slot-key-input" data-slot="${slot}"
                       value="${currentKey}" readonly
                       placeholder="Press key"
                       style="width: 100px; text-align: center; margin-right: 8px; cursor: pointer;">
                <select class="weapon-select" data-slot="${slot}" style="width: 140px;">
                    <option value="">-- Select --</option>
                    ${WEAPONS.map(weapon =>
                        `<option value="${weapon}" ${currentWeapon === weapon ? 'selected' : ''}>${weapon}</option>`
                    ).join('')}
                </select>
            `;

            const select = item.querySelector('.weapon-select');
            select.addEventListener('change', (e) => {
                weaponChangeCallback(slot, e.target.value);
            });

            // Use KeyCapture utility for consistent key capture
            const keyInput = item.querySelector('.slot-key-input');
            KeyCapture.setupInput(
                keyInput,
                (key) => {
                    keybindingChangeCallback(slot, key);
                    keyInput.value = key;
                }
            );

            this.elements.weaponSlotsList.appendChild(item);
        }
    }

    /**
     * Get normalized key name from keyboard event
     * Delegates to KeyCapture utility for consistency
     */
    getKeyName(event) {
        return KeyCapture.getKeyName(event);
    }

    /**
     * Get mouse button name from mouse event
     * Delegates to KeyCapture utility for consistency
     */
    getMouseButtonName(event) {
        return KeyCapture.getMouseButtonName(event);
    }

    /**
     * Set round size input value
     */
    setRoundSize(size) {
        this.elements.roundSizeInput.value = size;
    }

    /**
     * Get round size from input
     */
    getRoundSize() {
        return parseInt(this.elements.roundSizeInput.value, 10);
    }

    /**
     * Set fake attacks settings
     */
    setFakeAttacksSettings(enabled, cancelKey) {
        this.elements.fakeAttacksCheckbox.checked = enabled;
        this.elements.cancelKeyInput.value = cancelKey;
    }

    /**
     * Show pressure bar
     */
    showPressureBar() {
        this.elements.pressureBarContainer.style.display = 'block';
    }

    /**
     * Hide pressure bar
     */
    hidePressureBar() {
        this.elements.pressureBarContainer.style.display = 'none';
    }

    /**
     * Update pressure bar percentage
     */
    updatePressureBar(percentage) {
        this.elements.pressureBarFill.style.width = `${percentage}%`;
        this.elements.pressureBarText.textContent = `${Math.round(percentage)}%`;
    }

    /**
     * Set pressure bar to warning state
     */
    setPressureBarWarning() {
        this.elements.pressureBarFill.classList.remove('critical');
        this.elements.pressureBarFill.classList.add('warning');
    }

    /**
     * Set pressure bar to critical state
     */
    setPressureBarCritical() {
        this.elements.pressureBarFill.classList.remove('warning');
        this.elements.pressureBarFill.classList.add('critical');
    }

    /**
     * Reset pressure bar state
     */
    resetPressureBarState() {
        this.elements.pressureBarFill.classList.remove('warning', 'critical');
    }

    /**
     * Show game over flash overlay
     */
    showGameOverFlash() {
        const overlay = document.createElement('div');
        overlay.className = 'pressure-game-over';
        overlay.textContent = 'GAME OVER!';
        document.querySelector('.main-display').appendChild(overlay);
        setTimeout(() => overlay.remove(), 800);
    }

    /**
     * Set pressure mode settings in config UI
     */
    setPressureModeSettings(enabled, drainRate) {
        this.elements.pressureModeCheckbox.checked = enabled;
        this.elements.pressureDrainRateInput.value = drainRate;
    }

    // ==================== Weapon Select Mode UI Methods ====================

    /**
     * Initialize weapon select lanes with weapon names
     */
    renderWeaponSelectLanes(slotKeybindings, weaponSlots) {
        this.elements.weaponSelectLanes.innerHTML = '';
        this.elements.weaponSelectLaneLabels.innerHTML = '';

        for (let i = 1; i <= CONFIG.WEAPON_SELECT_MODE.LANE_COUNT; i++) {
            // Create lane
            const lane = document.createElement('div');
            lane.className = 'weapon-select-lane';
            lane.dataset.lane = i;
            this.elements.weaponSelectLanes.appendChild(lane);

            // Create label with weapon name
            const label = document.createElement('div');
            label.className = 'weapon-select-lane-label';
            const weaponName = weaponSlots[i] || `Slot ${i}`;
            label.textContent = this.getShortWeaponName(weaponName);
            label.title = weaponName; // Full name on hover
            this.elements.weaponSelectLaneLabels.appendChild(label);
        }

        // Set hit line position from config
        this.elements.weaponSelectHitZone.style.bottom = `${CONFIG.WEAPON_SELECT_MODE.HIT_LINE_BOTTOM_PX}px`;
    }

    /**
     * Calculate hit line position ratio based on actual element positions.
     * This ensures hit detection timing matches the visual line position.
     * Must be called after the weapon select screen is visible.
     */
    calculateHitLineRatio() {
        const lanes = this.elements.weaponSelectLanes;
        const hitZone = this.elements.weaponSelectHitZone;
        const noteHeight = CONFIG.WEAPON_SELECT_MODE.NOTE_HEIGHT;
        const startOffset = CONFIG.WEAPON_SELECT_MODE.NOTE_START_OFFSET;
        const endOffset = CONFIG.WEAPON_SELECT_MODE.NOTE_END_OFFSET;

        // Get actual positions relative to the viewport
        const lanesRect = lanes.getBoundingClientRect();
        const hitZoneRect = hitZone.getBoundingClientRect();

        // Calculate where the hit zone is relative to the lanes
        const lanesHeight = lanesRect.height;
        const hitLineFromLanesTop = hitZoneRect.top - lanesRect.top;

        // Animation goes from -startOffset to lanesHeight + endOffset
        const totalDistance = lanesHeight + startOffset + endOffset;

        // Note center should be at hit line: note_top + noteHeight/2 = hitLineFromLanesTop
        // So note_top = hitLineFromLanesTop - noteHeight/2
        // Distance from start (-startOffset) to note_top:
        const distanceToLine = (hitLineFromLanesTop - noteHeight / 2) - (-startOffset);

        // Ratio of fall duration when note center reaches the line
        return distanceToLine / totalDistance;
    }

    /**
     * Get shortened weapon name for display
     */
    getShortWeaponName(weaponName) {
        const shortNames = {
            'Greatsword': 'GS',
            'Crossbow': 'XBow',
            'LongBow': 'Bow',
            'TwinBlade': 'Twin',
            'Pistols': 'Guns'
        };
        return shortNames[weaponName] || weaponName;
    }

    /**
     * Create a note element in a lane
     */
    createNote(noteId, laneIndex, weaponName, fallDuration) {
        const lane = this.elements.weaponSelectLanes.querySelector(`[data-lane="${laneIndex}"]`);
        if (!lane) return null;

        const note = document.createElement('div');
        note.className = 'weapon-select-note';
        note.dataset.noteId = noteId;
        note.dataset.lane = laneIndex;
        note.title = weaponName; // Full name on hover

        // Wrap text in span for counter-rotation
        const textSpan = document.createElement('span');
        textSpan.textContent = this.getShortWeaponName(weaponName);
        note.appendChild(textSpan);

        note.style.top = '-40px';
        note.style.animation = `noteFall ${fallDuration}ms linear forwards`;

        lane.appendChild(note);
        return note;
    }

    /**
     * Remove a note by ID
     */
    removeNote(noteId) {
        const note = this.elements.weaponSelectLanes.querySelector(`[data-note-id="${noteId}"]`);
        if (note) {
            note.remove();
        }
    }

    /**
     * Mark a note as hit
     */
    markNoteHit(noteId) {
        const note = this.elements.weaponSelectLanes.querySelector(`[data-note-id="${noteId}"]`);
        if (note) {
            note.classList.add('note-hit');
            const laneIndex = note.dataset.lane;
            this.flashLane(laneIndex, 'hit');
            setTimeout(() => note.remove(), 150);
        }
    }

    /**
     * Mark a note as missed
     */
    markNoteMiss(noteId) {
        const note = this.elements.weaponSelectLanes.querySelector(`[data-note-id="${noteId}"]`);
        if (note) {
            note.classList.add('note-miss');
            const laneIndex = note.dataset.lane;
            this.flashLane(laneIndex, 'miss');
        }
    }

    /**
     * Flash a lane for hit/miss feedback
     */
    flashLane(laneIndex, type) {
        const lane = this.elements.weaponSelectLanes.querySelector(`[data-lane="${laneIndex}"]`);
        if (lane) {
            lane.classList.add(`lane-${type}`);
            setTimeout(() => lane.classList.remove(`lane-${type}`), 150);
        }
    }

    /**
     * Update weapon select stats display
     */
    updateWeaponSelectStats(hits, misses, accuracy) {
        this.elements.weaponSelectHits.textContent = hits;
        this.elements.weaponSelectMisses.textContent = misses;
        this.elements.weaponSelectAccuracy.textContent = `${accuracy}%`;
    }

    /**
     * Update weapon select time display
     */
    updateWeaponSelectTime(seconds) {
        this.elements.weaponSelectTime.textContent = seconds;
    }

    /**
     * Clear all notes from lanes
     */
    clearWeaponSelectNotes() {
        const notes = this.elements.weaponSelectLanes.querySelectorAll('.weapon-select-note');
        notes.forEach(note => note.remove());
    }

    /**
     * Show weapon select results on results screen
     */
    showWeaponSelectResults(hits, misses, accuracy) {
        this.elements.resultsTitle.textContent = 'Weapon Select Complete!';
        this.elements.resultsTitle.classList.add('weapon-select-results-title');

        // Update stat values
        this.elements.avgTime.textContent = hits;
        this.elements.fastestTime.textContent = misses;
        this.elements.slowestTime.textContent = `${accuracy}%`;

        // Update stat labels using cached elements
        if (this.statLabels) {
            this.statLabels.avgTime.textContent = 'Total Hits';
            this.statLabels.fastestTime.textContent = 'Total Misses';
            this.statLabels.slowestTime.textContent = 'Accuracy';
        }

        this.elements.newPBCount.parentElement.style.display = 'none';
        this.elements.resultsList.innerHTML = '';
        this.elements.resultsList.parentElement.style.display = 'none';
    }

    /**
     * Reset results screen to normal mode
     */
    resetResultsScreen() {
        this.elements.resultsTitle.classList.remove('weapon-select-results-title');

        // Reset stat labels using cached elements
        if (this.statLabels) {
            this.statLabels.avgTime.textContent = 'Average Time';
            this.statLabels.fastestTime.textContent = 'Fastest';
            this.statLabels.slowestTime.textContent = 'Slowest';
        }

        this.elements.newPBCount.parentElement.style.display = '';
        this.elements.resultsList.parentElement.style.display = '';
    }

    /**
     * Cache stat label elements (called once on init)
     */
    cacheStatLabels() {
        const statCards = document.querySelectorAll('.stat-card');
        this.statLabels = {
            avgTime: statCards[0]?.querySelector('.stat-label'),
            fastestTime: statCards[1]?.querySelector('.stat-label'),
            slowestTime: statCards[2]?.querySelector('.stat-label')
        };
    }

    /**
     * Get weapon select mode settings
     */
    getWeaponSelectSettings() {
        return {
            speed: this.elements.weaponSelectSpeedSelect.value,
            duration: parseInt(this.elements.weaponSelectDurationSelect.value, 10)
        };
    }

    /**
     * Set weapon select mode settings
     */
    setWeaponSelectSettings(speed, duration) {
        this.elements.weaponSelectSpeedSelect.value = speed;
        this.elements.weaponSelectDurationSelect.value = duration.toString();
    }

    // ==================== Common Patterns UI Methods ====================

    /**
     * Generate all skill options for pattern dropdowns
     */
    generateSkillOptions(weaponSlots) {
        const options = ['<option value="">-- Select Skill --</option>'];

        for (let slot = 1; slot <= 8; slot++) {
            const weapon = weaponSlots[slot];
            if (weapon) {
                options.push(`<option value="${weapon}-Q">${weapon} Q</option>`);
                options.push(`<option value="${weapon}-E">${weapon} E</option>`);
            }
        }

        return options.join('');
    }

    /**
     * Format skill object to string for select value
     */
    formatSkillToString(skill) {
        if (!skill || !skill.weapon || !skill.skill) return '';
        return `${skill.weapon}-${skill.skill}`;
    }

    /**
     * Parse skill string to object
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
     * Render common patterns list
     */
    renderPatterns(patterns, weaponSlots, onPatternChange, onPatternRemove) {
        this.elements.patternsList.innerHTML = '';

        if (patterns.length === 0) {
            this.elements.patternsList.innerHTML = '<div class="patterns-empty">No patterns defined. Click "Add Pattern" to create one.</div>';
            return;
        }

        const skillOptions = this.generateSkillOptions(weaponSlots);

        patterns.forEach((pattern, index) => {
            const item = document.createElement('div');
            item.className = 'pattern-item';
            item.dataset.index = index;

            item.innerHTML = `
                <select class="pattern-select pattern-from" data-index="${index}">
                    ${skillOptions}
                </select>
                <span class="pattern-arrow">→</span>
                <select class="pattern-select pattern-to" data-index="${index}">
                    ${skillOptions}
                </select>
                <button class="remove-pattern-btn" data-index="${index}">×</button>
            `;

            // Set current values (convert object to string for select)
            const fromSelect = item.querySelector('.pattern-from');
            const toSelect = item.querySelector('.pattern-to');

            fromSelect.value = this.formatSkillToString(pattern.from);
            toSelect.value = this.formatSkillToString(pattern.to);

            // Event listeners (convert string back to object)
            fromSelect.addEventListener('change', (e) => {
                onPatternChange(index, 'from', this.parseSkillString(e.target.value));
            });

            toSelect.addEventListener('change', (e) => {
                onPatternChange(index, 'to', this.parseSkillString(e.target.value));
            });

            item.querySelector('.remove-pattern-btn').addEventListener('click', () => {
                onPatternRemove(index);
            });

            this.elements.patternsList.appendChild(item);
        });
    }

    /**
     * Set pattern likelihood input value
     */
    setPatternLikelihood(likelihood) {
        this.elements.patternLikelihoodInput.value = likelihood;
    }

    /**
     * Get pattern likelihood from input
     */
    getPatternLikelihood() {
        return parseInt(this.elements.patternLikelihoodInput.value, 10) || 100;
    }
}
