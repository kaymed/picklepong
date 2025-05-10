# TRON Pickleball Pong

An 8-bit TRON-inspired version of the classic Pickleball Pong game.

![TRON Pickleball Pong](tron_pickleball_screenshot.png)

## Game Features

- Retro 8-bit pixel art style
- TRON-inspired neon grid background
- Glowing paddles and ball with particle effects
- Pixelated text and UI elements
- Scanline effects for authentic retro feel
- Particle explosion effects on collisions and scoring

## Visual Elements

- **Grid Background**: Classic TRON-style grid with bright neon lines
- **Neon Colors**: Bright cyan, orange, pink, and green glow effects
- **Pixelated Graphics**: All game elements rendered in 8-bit style
- **Particle Effects**: Explosions when the ball hits paddles or scores
- **Trail Effects**: Ball leaves a pixelated trail as it moves

## How to Play

1. **Controls**:
   - **Player 1 (Left/Blue)**: W (up) and S (down)
   - **Player 2 (Right/Orange)**: Up Arrow (up) and Down Arrow (down)
   - **Serve**: Space bar
   - **Quit**: ESC key

2. **Objective**:
   - Score points by getting the ball past your opponent's paddle
   - First player to reach 11 points wins

## Requirements

- Python 3.x
- Pygame library

## Installation

1. Make sure you have Python installed on your system
2. Install Pygame if you don't have it already:
   ```
   pip install pygame
   ```
3. Run the game:
   ```
   python pickleball_pong_tron.py
   ```

## Optional: Custom Pixel Font

For an even more authentic 8-bit look, you can add a pixel font:

1. Download a free pixel font (like "Press Start 2P" or "VCR OSD Mono")
2. Save it as "pixel.ttf" in the same directory as the game
3. The game will automatically use this font if available

## Customization

You can modify the game's appearance by changing the color constants at the top of the file:

```python
# 8-bit TRON-inspired Color Scheme
BACKGROUND_COLOR = (0, 0, 20)       # Very dark blue, almost black
GRID_COLOR = (0, 50, 80)            # Dark blue for grid
GRID_BRIGHT_COLOR = (0, 100, 160)   # Brighter blue for main grid lines
NEON_BLUE = (0, 200, 255)           # Bright cyan/blue for Player 1
NEON_ORANGE = (255, 120, 0)         # Bright orange for Player 2
NEON_PINK = (255, 0, 150)           # Bright pink for accents
NEON_GREEN = (0, 255, 100)          # Bright green for ball
```

Enjoy your journey into the TRON-inspired digital world of Pickleball Pong!