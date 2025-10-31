# Cosmyping: The Last Scribe

A fast-paced typing game built with HTML5 Canvas and pure JavaScript.

## Controls

- **Type words** to target and destroy enemies
- **Q** - Nova Bomb (clears all enemies)
- **W** - Time Warp (slows all enemies)
- **E** - Scribe's Focus (auto-completes next 3 words)
- **P** - Pause/Resume
- **ESC** - Return to menu
- **Hangar**: Press 1-4 keys to purchase upgrades

## Features

- Multiple enemy types: Drones, Cruisers, Corrupted Asteroids, Mines
- Boss battles every 5 levels
- Combo multiplier system
- Real-time WPM tracking
- Ship upgrades in the Hangar
- Three special abilities with cooldowns
- LocalStorage persistence for progress

## Installation

Open `index.html` in a modern web browser(after forking).


I made this game with a lot of struggle but it was great learning experience. I took some help from google, teachers and ai but it was quite hectic and learning experience. I coded a lot and learned a lot of concepts. Implementing the HTML5 Canvas rendering system required learning advanced graphics programming—using transforms, gradients, and custom coordinate systems to create particle effects, animated enemies, and dynamic visual feedback. 

The most complex part was designing the real-time input matching system that tracks typing prefixes across multiple enemies simultaneously and automatically targets the closest match, which required understanding string manipulation and efficient search algorithms. I also struggled with game architecture, implementing a proper scene management system with state transitions, object-oriented design using class inheritance for enemy types, and performance optimization by managing hundreds of particles efficiently.

Building the boss battle system with multi-phase mechanics, shield systems, and complex animation states taught me about game state machines and event-driven programming. Additionally, implementing LocalStorage persistence for player progress and understanding the game loop timing with requestAnimationFrame were significant learning experiences that gave me deeper insight into browser APIs and game development fundamentals.

it is still in progress but you still can enjoy it.

Learned a lot!

[![Athena Award Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Faward.athena.hackclub.com%2Fapi%2Fbadge)](https://award.athena.hackclub.com?utm_source=readme)
