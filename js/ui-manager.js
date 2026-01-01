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
            autoAdvanceCheckbox: document.getElementById('autoAdvanceCheckbox'),
            autoAdvanceDelayInput: document.getElementById('autoAdvanceDelayInput'),
            includeSkillsCheckbox: document.getElementById('includeSkillsCheckbox'),
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

        // Update weapon image - use skill image if skill present, otherwise weapon image
        let weaponImagePath;
        if (component.skill) {
            const skillKey = `${component.weapon}-${component.skill.toLowerCase()}`;
            weaponImagePath = WEAPON_SKILL_IMAGES[skillKey] || WEAPON_IMAGES[component.weapon];
        } else {
            weaponImagePath = WEAPON_IMAGES[component.weapon];
        }
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
     * Render key indicators for weapon skill (slot number + skill letter)
     */
    renderKeyIndicators(requiredKeys) {
        this.elements.keyIndicators.innerHTML = requiredKeys.map(key => {
            const displayKey = this.getDisplayKey(key);
            const elementId = this.getKeyElementId(key);

            return `<span id="${elementId}" class="key-indicator skill-key">${displayKey}</span>`;
        }).join('');
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

    /**
     * Set include skills checkbox
     */
    setIncludeSkills(includeSkills) {
        this.elements.includeSkillsCheckbox.checked = includeSkills;
    }
}
