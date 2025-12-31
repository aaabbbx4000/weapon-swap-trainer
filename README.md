# Component Trainer

A V Rising weapon swap training application to help improve your component execution speed and build muscle memory.

## Features

- **Training Mode**: Practice random components with real-time feedback
- **Personal Bests**: Track your best time for each component
- **Statistics**: View average, fastest, and slowest times after each round
- **Customizable Components**: Add, remove, or import/export your own component lists
- **Auto-Skip Option**: Automatically advance to the next component after a time limit
- **Progress Tracking**: See your times during the round and track improvements

## Getting Started

### Quick Start
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Click "Start Round" to begin training
4. Press the displayed key combinations as they appear on screen

That's it! No installation or build process needed.

## How to Use

### Training
1. Click **"Start Round"** to begin
2. A 3-second countdown will appear
3. Press the key sequence shown on screen (e.g., press `1`, then `Q`)
4. Complete all components in the round
5. View your results and personal bests

### Configuring Components

Click the **"Configure"** button to customize your training:

#### Adding Components
1. Enter the key combination (e.g., `1,e` or `2,LeftMouseButton`)
2. Enter a description (e.g., "crossbow attack")
3. Click "Add"

#### Import/Export
- **Export**: Save your components as a JSON file
- **Import**: Load components from a previously saved JSON file

### Settings

- **Components per round**: Choose how many components to practice (1-9999)
- **Auto-skip**: Enable automatic advancement after a time limit (adjustable from 0.1 to 10 seconds)

## Key Features Explained

### Personal Bests
The app automatically tracks your fastest time for each component. When you beat a personal best, you'll see a ★ indicator and "NEW PB!" message.

### Round Statistics
After each round, view:
- **Average Time**: Your mean completion time
- **Fastest**: Your quickest component
- **Slowest**: Your slowest component
- **New PBs**: How many personal bests you achieved

### Error Tracking
If you press the wrong key, the indicators will flash red and reset. Errors are counted but don't stop your progress.

## Keyboard Shortcuts

- **Any Key**: Use during training to execute components
- **Escape**: Close open modals
- **Enter**: Add a new component (when typing in the description field)

## Default Components

The app comes pre-loaded with common V Rising weapon components. You can find the complete list in `components.json` and import it anytime through the Configure menu.

## Data Storage

All your data is saved locally in your browser:
- Your component list
- All personal best times
- Your preferences (round size, auto-skip settings)

**Note**: Clearing your browser data will reset everything.

## Browser Compatibility

Works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Tips for Best Results

1. **Start with smaller rounds** (5-10 components) to build consistency
2. **Use auto-skip** to maintain rhythm and prevent overthinking
3. **Focus on accuracy first**, then speed
4. **Track your progress** by reviewing your personal bests regularly

## Support

If you encounter any issues or have suggestions, please open an issue on GitHub.

---

Happy training!
