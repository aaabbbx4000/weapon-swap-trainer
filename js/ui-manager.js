/**
 * UI Manager - Handles all DOM manipulation and rendering
 */

import { SCREENS, KEY_MAPPINGS, CONFIG } from './config.js';

export class UIManager {
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
            componentName: document.getElementById('componentName'),
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
            componentsList: document.getElementById('componentsList'),
            componentsListHeader: document.getElementById('componentsListHeader'),
            newComponentKey: document.getElementById('newComponentKey'),
            newComponentDesc: document.getElementById('newComponentDesc'),
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
     * Update component display
     */
    updateComponent(component, currentIndex, totalCount) {
        this.elements.componentName.textContent = component.description;
        this.elements.roundProgress.textContent = `Component ${currentIndex + 1} / ${totalCount}`;

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
     * Render key indicators
     */
    renderKeyIndicators(requiredKeys) {
        this.elements.keyIndicators.innerHTML = requiredKeys.map(key => {
            const displayKey = this.getDisplayKey(key);
            const elementId = this.getKeyElementId(key);

            return `<span id="${elementId}" class="key-indicator">${displayKey}</span>`;
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
     * Update key indicators based on progress
     */
    updateKeyIndicators(requiredKeys, currentKeyIndex) {
        requiredKeys.forEach((key, index) => {
            const elementId = this.getKeyElementId(key);
            const element = document.getElementById(elementId);

            if (!element) return;

            if (index < currentKeyIndex) {
                element.className = 'key-indicator key-completed';
            } else {
                element.className = 'key-indicator';
            }
        });
    }

    /**
     * Flash error on key indicators
     */
    flashKeyError(requiredKeys, callback) {
        requiredKeys.forEach(key => {
            const element = document.getElementById(this.getKeyElementId(key));
            if (element) {
                element.className = 'key-indicator key-error';
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
            this.elements.resultsTitle.textContent = `Round Stopped (${results.length}/${roundSize} components)`;
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
     * Render components list in config
     */
    renderComponentsList(components, deleteCallback) {
        this.elements.componentsListHeader.textContent = `Components (${components.length})`;
        this.elements.componentsList.innerHTML = '';

        components.forEach((comp, index) => {
            const item = document.createElement('div');
            item.className = 'config-component-item';
            item.innerHTML = `
                <div class="config-component-info">
                    <span class="config-component-key">[${comp.key}]</span>
                    <span class="config-component-desc">${comp.description}</span>
                </div>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;

            const deleteBtn = item.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteCallback(index));

            this.elements.componentsList.appendChild(item);
        });
    }

    /**
     * Clear component input fields
     */
    clearComponentInputs() {
        this.elements.newComponentKey.value = '';
        this.elements.newComponentDesc.value = '';
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
