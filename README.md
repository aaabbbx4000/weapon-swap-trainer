# Weapon Swap Trainer

A V Rising weapon swap training application to help improve your weapon skill execution speed and build muscle memory.

## Screenshots

### Training Mode
Practice weapon skills with visual feedback and real-time performance tracking.

![Training Mode](images/showcase/train_weapons.png)

### Weapon Configuration
Easily configure your weapon loadout for slots 1-8.

![Weapon Configuration](images/showcase/config_weapons.png)

## Features

- **Weapon Attack Mode**: Practice random weapon skills with real-time feedback
- **Weapon Select Mode**: Lane-based training where notes fall and you must hit the correct weapon slot key at the right time
- **Pressure Mode**: A draining bar that adds intensity - succeed to boost it, fail and it depletes faster
- **Common Patterns**: Define weapon swap patterns to influence skill selection order for realistic practice
- **Personal Bests**: Track your best time for each weapon skill
- **Statistics**: View average, fastest, and slowest times after each round
- **Weapon Selection**: Configure which weapons are in slots 1-8
- **Custom Keybindings**: Match your in-game weapon slot keybindings - supports keyboard keys, special keys (Ctrl, Shift, Alt), and mouse buttons
- **Weapon Fake Attacks**: Practice cancellation mechanics for advanced PvP techniques

## Getting Started

### Quick Start
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Click "Weapon Attack" or "Weapon Select" to begin training
4. Press the displayed key combinations as they appear on screen

That's it! No installation or build process needed.

## Training Modes

### Weapon Attack Mode
Traditional training where you execute weapon skills as they appear:

1. Click **"Weapon Attack"** to begin
2. A countdown will appear
3. Press the key sequence shown (e.g., press `1` for the weapon slot, then `Q` for the skill)
4. Complete all weapon skills in the round
5. View your results and personal bests

### Weapon Select Mode
A lane-based mode where notes fall from the top of the screen:

1. Click **"Weapon Select"** to begin
2. Notes will fall down lanes representing each weapon slot
3. Press the correct weapon slot key when a note reaches the hit line
4. Aim for accuracy and timing
5. Configure note speed and duration in the settings

## Configuration

Click the **"Configure"** button to access all settings:

### Weapon Slots (1-8)
- Select which weapon you want in each slot (1-8)
- **Customize slot keybindings** to match your in-game bindings
  - Click the key input box next to each slot to set a custom key
  - Example: Change slot 1 from "1" to "F" if you use F for your first weapon slot
- Available weapons:
  - Spear, Slasher, Axe, Mace, Sword, Crossbow, Greatsword, Whip
  - LongBow, Dagger, Claw, TwinBlade, Pistols, Reaper

### Common Patterns
Define weapon swap patterns that influence which skill comes next:

1. Click **"Common Patterns"** in the Configure menu
2. Add patterns like "Slasher E -> Spear Q" to practice realistic combos
3. Set **Pattern Likelihood** (0-100%) to control how often patterns are followed
4. Default patterns included:
   - Slasher E -> Spear Q
   - Sword E -> Reaper Q
   - Axe E -> Greatsword Q
   - Reaper E -> Spear Q
   - Pistols E -> Greatsword Q

### Pressure Mode
Enable for an added challenge with a draining bar:

1. Enable **"Pressure Mode"** in Options
2. The bar constantly drains during training
3. Successful skill execution boosts the bar
4. Errors cause a significant penalty
5. If the bar empties, the round ends
6. Adjust **Drain Speed** to customize difficulty

### Weapon Fake Attacks
Practice advanced cancellation mechanics:

1. Enable **"Weapon Fake Attacks"** in Options
2. Set your **Cancellation Key** (default: Mouse3)
3. Supported fake attacks:
   - **Greatsword Q** (Slot + Q + Cancel Key)
   - **Sword E** (Slot + E + Cancel Key)
   - **Axe E** (Slot + E + Cancel Key)
4. Fake attacks appear with "FAKE" overlay and yellow text

### Weapon Select Mode Settings
Customize the lane-based mode:

- **Note Speed**: Learning, Slower, Slow, Medium, or Fast
- **Duration**: 30s, 60s, 90s, or Endless

## Custom Keybindings

The trainer supports **custom keybindings for weapon slots** to match your in-game setup:

### Supported Input Types
- **Keyboard keys**: Letters, numbers, function keys, etc.
- **Special keys**: Ctrl, Shift, Alt, Space, etc.
- **Mouse buttons**: Mouse1 (left), Mouse2 (right), Mouse3 (middle), Mouse4/5 (side buttons)

### How to Set Up
1. Go to **Configure** -> **Weapon Slots**
2. Click the key input box next to any slot
3. Press the key or mouse button you want to bind
4. The trainer will now use your custom bindings during training

## Default Configuration

On first run, the app loads with these defaults:

**Weapon Slots:**
1. Spear
2. Reaper
3. LongBow
4. Axe
5. Pistols
6. Sword
7. Slasher
8. Greatsword

**Default Keybindings:**
- Slots 1-3: Keys 1, 2, 3
- Slot 4: R
- Slot 5: Mouse5
- Slot 6: Mouse4
- Slot 7: X
- Slot 8: C

**Other Defaults:**
- Pressure Mode: Enabled
- Fake Attacks: Disabled
- Pattern Likelihood: 100%

## Key Features Explained

### Personal Bests
The app automatically tracks your fastest time for each weapon skill. When you beat a personal best, you'll see a star indicator and "NEW PB!" message.

### Round Statistics
After each round, view:
- **Average Time**: Your mean completion time
- **Fastest**: Your quickest skill
- **Slowest**: Your slowest skill
- **New PBs**: How many personal bests you achieved

### Error Handling
- In normal mode: Indicators flash red and reset on wrong key press
- In pressure mode: Errors drain the pressure bar significantly

## Data Storage

All your data is saved locally in your browser:
- Weapon slot configuration
- Slot keybindings
- Personal best times
- Common patterns
- All preferences (pressure mode, fake attacks, etc.)

**Note**: Clearing your browser data will reset everything.

## Browser Compatibility

Works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Tips for Best Results

1. **Start with Weapon Attack** to learn the basic key sequences
2. **Use Common Patterns** to practice realistic weapon swap combos
3. **Enable Pressure Mode** when ready for added challenge
4. **Try Weapon Select Mode** to improve your reaction time
5. **Track your progress** by reviewing your personal bests regularly

## Support

If you encounter any issues or have suggestions, please open an issue on GitHub.

---

Happy training!
