/**
 * Key Capture Utility - Reusable key/mouse capture for input binding
 */

const KeyCapture = {
    // Keys that should not be bindable
    IGNORED_KEYS: ['Tab', 'Escape', 'Enter', 'CapsLock', 'NumLock', 'ScrollLock'],

    // Key name mappings for display
    KEY_MAP: {
        'Control': 'Ctrl',
        'ControlLeft': 'LeftCtrl',
        'ControlRight': 'RightCtrl',
        'ShiftLeft': 'LeftShift',
        'ShiftRight': 'RightShift',
        'AltLeft': 'LeftAlt',
        'AltRight': 'RightAlt',
        ' ': 'Space'
    },

    // Mouse button names
    MOUSE_BUTTONS: {
        0: 'Mouse1',
        1: 'Mouse3',  // Middle
        2: 'Mouse2',  // Right
        3: 'Mouse4',  // Back
        4: 'Mouse5'   // Forward
    },

    /**
     * Get normalized key name from keyboard event
     */
    getKeyName(event) {
        if (this.IGNORED_KEYS.includes(event.key)) {
            return null;
        }

        // Check for left/right distinction
        if (event.code && (event.code.startsWith('Control') ||
            event.code.startsWith('Shift') ||
            event.code.startsWith('Alt'))) {
            return this.KEY_MAP[event.code] || event.code;
        }

        return this.KEY_MAP[event.key] || event.key;
    },

    /**
     * Get mouse button name from mouse event
     */
    getMouseButtonName(event) {
        return this.MOUSE_BUTTONS[event.button] || `Mouse${event.button}`;
    },

    /**
     * Setup key capture on an input element
     * @param {HTMLInputElement} input - The input element
     * @param {Function} onCapture - Callback with captured key name
     * @param {Function} onError - Optional error callback
     */
    setupInput(input, onCapture, onError = null) {
        let isFocused = false;

        const handleKeydown = (e) => {
            e.preventDefault();
            const key = this.getKeyName(e);
            if (key) {
                try {
                    onCapture(key);
                    input.value = key;
                } catch (error) {
                    if (onError) onError(error);
                }
            }
        };

        const handleMousedown = (e) => {
            if (!isFocused) {
                // Initial click to focus - allow it
                return;
            }

            e.preventDefault();
            const buttonName = this.getMouseButtonName(e);
            try {
                onCapture(buttonName);
                input.value = buttonName;
                input.blur();
            } catch (error) {
                if (onError) onError(error);
            }
        };

        const handleFocus = () => {
            isFocused = false; // Reset on focus, next mousedown is initial click
            setTimeout(() => { isFocused = true; }, 100);
        };

        const handleContextmenu = (e) => {
            e.preventDefault();
        };

        input.addEventListener('keydown', handleKeydown);
        input.addEventListener('mousedown', handleMousedown);
        input.addEventListener('focus', handleFocus);
        input.addEventListener('contextmenu', handleContextmenu);

        // Return cleanup function
        return () => {
            input.removeEventListener('keydown', handleKeydown);
            input.removeEventListener('mousedown', handleMousedown);
            input.removeEventListener('focus', handleFocus);
            input.removeEventListener('contextmenu', handleContextmenu);
        };
    }
};
