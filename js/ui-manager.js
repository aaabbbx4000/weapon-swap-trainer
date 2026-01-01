/**
 * UI Manager - Handles all DOM manipulation and rendering
 */

class UIManager {
    constructor() {
        this.elements = this.cacheElements();
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
            skillKeyOverlay: document.getElementById('skillKeyOverlay'),
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
            autoAdvanceCheckbox: document.getElementById('autoAdvanceCheckbox'),
            autoAdvanceDelayInput: document.getElementById('autoAdvanceDelayInput'),
            weaponSlotsList: document.getElementById('weaponSlotsList'),
            pbListContent: document.getElementById('pbListContent')
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
        // Update weapon name
        this.elements.weaponName.textContent = component.weapon;

        // Update weapon image
        const weaponImagePath = WEAPON_IMAGES[component.weapon];
        this.elements.weaponImage.src = weaponImagePath;
        this.elements.weaponImage.className = 'weapon-image';

        // Update skill key overlay (just Q or E)
        this.elements.skillKeyOverlay.textContent = component.skill;
        this.elements.skillKeyOverlay.className = 'skill-key-overlay';

        this.elements.roundProgress.textContent = `Skill ${currentIndex + 1} / ${totalCount}`;
    }

    /**
     * Parse component keys
     */
    parseKeys(keyString) {
        return keyString.split(',').map(k => k.trim());
    }

    /**
     * Update visual feedback based on progress
     */
    updateKeyIndicators(requiredKeys, currentKeyIndex) {
        // Update weapon image and skill overlay based on progress
        if (currentKeyIndex === 0) {
            // No keys pressed yet
            this.elements.weaponImage.className = 'weapon-image';
            this.elements.skillKeyOverlay.className = 'skill-key-overlay';
        } else if (currentKeyIndex === 1) {
            // Slot number pressed correctly (first key)
            this.elements.weaponImage.className = 'weapon-image';
            this.elements.skillKeyOverlay.className = 'skill-key-overlay';
        } else if (currentKeyIndex >= requiredKeys.length) {
            // All keys pressed correctly (skill complete)
            this.elements.weaponImage.className = 'weapon-image weapon-complete';
            this.elements.skillKeyOverlay.className = 'skill-key-overlay skill-complete';
        }
    }

    /**
     * Flash error on weapon image and skill overlay
     */
    flashKeyError(requiredKeys, callback) {
        // Show error on weapon image and skill overlay
        this.elements.weaponImage.className = 'weapon-image weapon-error';
        this.elements.skillKeyOverlay.className = 'skill-key-overlay skill-error';

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
     * Render results list
     */
    renderResultsList(results) {
        this.elements.resultsList.innerHTML = '';

        const sortedResults = [...results].sort((a, b) => b.time - a.time);

        sortedResults.forEach((result, index) => {
            const item = document.createElement('div');
            item.className = 'result-item';

            const errorDisplay = result.errors > 0
                ? ` <span class="error-count">×${result.errors}</span>`
                : '';

            const pbBadge = result.isNewPB ? ' ★ NEW PB' : '';
            const timeClass = result.isNewPB ? 'result-time-pb' : 'result-time';

            item.innerHTML = `
                <span>${index + 1}. ${result.component}${errorDisplay}</span>
                <span class="${timeClass}">${result.time.toFixed(1)}s${pbBadge}</span>
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
    renderWeaponSlots(weaponSlots, changeCallback) {
        this.elements.weaponSlotsList.innerHTML = '';

        for (let slot = 1; slot <= 8; slot++) {
            const item = document.createElement('div');
            item.className = 'weapon-slot-item';

            const currentWeapon = weaponSlots[slot] || '';

            item.innerHTML = `
                <label class="weapon-slot-label">Slot ${slot}:</label>
                <select class="weapon-select" data-slot="${slot}">
                    <option value="">-- Select Weapon --</option>
                    ${WEAPONS.map(weapon =>
                        `<option value="${weapon}" ${currentWeapon === weapon ? 'selected' : ''}>${weapon}</option>`
                    ).join('')}
                </select>
            `;

            const select = item.querySelector('.weapon-select');
            select.addEventListener('change', (e) => {
                changeCallback(slot, e.target.value);
            });

            this.elements.weaponSlotsList.appendChild(item);
        }
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
     * Set auto-advance settings
     */
    setAutoAdvanceSettings(enabled, delay) {
        this.elements.autoAdvanceCheckbox.checked = enabled;
        this.elements.autoAdvanceDelayInput.value = delay;
    }
}
