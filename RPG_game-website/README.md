# Fantasy Quest - Web-based RPG Game

A browser-based RPG game built with Phaser 3, featuring smooth animations, responsive controls, and engaging gameplay.

## Features

- Smooth character animations and movement
- Combat system with attack animations
- Enemy AI with pathfinding
- Health and score system
- Mobile-friendly controls
- Responsive design for various screen sizes

## How to Play

1. Use arrow keys to move your character
2. Press spacebar to attack enemies
3. Defeat enemies to increase your score
4. Avoid enemy attacks to prevent losing health

## Mobile Controls

- Use the on-screen D-pad on the left side to move
- Tap the "A" button on the right side to attack

## Running the Game

```bash
# Install Node.js if you don't have it already (https://nodejs.org)

# Navigate to the game directory
cd personal-website

# Start the local server
node server.js

# Open your browser and go to:
# http://localhost:3000
```

## Development

This game is built with:
- HTML5, CSS3, and JavaScript
- Phaser 3 game framework
- Node.js for the local development server

### Project Structure

```
/personal-website
├── assets/          # Game assets (images, audio, etc.)
├── css/             # Stylesheets
├── js/              # JavaScript code
│   ├── characters/  # Character classes
│   ├── scenes/      # Game scenes
│   ├── config.js    # Game configuration
│   └── game.js      # Main game initialization
├── index.html       # Main HTML file
├── server.js        # Local development server
└── README.md        # This file
```
