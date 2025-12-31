# Component Trainer

A V Rising weapon swap training application to help improve component execution speed.

## Features

- **Training Mode**: Practice random components with real-time feedback
- **Personal Bests**: Track your best time for each component
- **Statistics**: View average, fastest, and slowest times per round
- **Customizable**: Import/export component lists, configure round size
- **Auto-Skip**: Optional auto-advance after a time limit

## Project Structure

```
component-trainer/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # All styling
├── js/
│   ├── config.js          # Configuration constants
│   ├── storage.js         # localStorage management
│   ├── component-manager.js   # Component CRUD operations
│   ├── statistics-manager.js  # Personal bests and statistics
│   ├── ui-manager.js      # DOM manipulation and rendering
│   └── app.js             # Main application controller
└── README.md
```

## Architecture

### ES6 Modules
The application is built using ES6 modules for clean separation of concerns:

- **Config Module**: Application constants and defaults
- **Storage Manager**: Handles all localStorage operations
- **Component Manager**: Manages component data and operations
- **Statistics Manager**: Tracks personal bests and calculates stats
- **UI Manager**: Handles all DOM manipulation
- **Main App**: Orchestrates all modules and manages application state

### Design Patterns
- **Single Responsibility**: Each class has one clear purpose
- **Separation of Concerns**: UI, business logic, and storage are separated
- **Module Pattern**: ES6 modules for encapsulation
- **State Management**: Centralized state in main app controller

## Usage

1. Open `index.html` in a modern web browser
2. Click "Start Round" to begin training
3. Press the required key combinations as they appear
4. View your statistics and personal bests after each round

## Configuration

### Adding Components
1. Click "Configure" button
2. Enter key combination (e.g., `1,e` or `2,LeftMouseButton`)
3. Enter description (e.g., "crossbow attack")
4. Click "Add"

### Import/Export
- **Export**: Download your components as JSON
- **Import**: Load components from a JSON file

### Round Settings
- **Components per round**: Set how many components to practice (1-9999)
- **Auto-skip**: Automatically advance after a time limit

## Key Bindings

- **Training**: Press the displayed keys in sequence
- **Escape**: Close modals
- **Enter**: Add component (when in input field)

## Browser Compatibility

Requires a modern browser with ES6 module support:
- Chrome/Edge 61+
- Firefox 60+
- Safari 11+

## Data Persistence

All data is stored in browser localStorage:
- Component configurations
- Personal best times
- User preferences (round size, auto-skip settings)

## Code Standards

- ES6+ JavaScript
- Modular architecture
- Clear naming conventions
- JSDoc comments for public methods
- No dead code
- Consistent formatting
