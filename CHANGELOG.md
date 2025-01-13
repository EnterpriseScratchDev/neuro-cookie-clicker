# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Make it clear to Neuro when an error occurred when trying to buy a building or upgrade.
  Surely an error would never actually occur. Surely.

## [1.0.0] - 2025-01-12

Pushed to the Steam Workshop on 2025-01-12.

### Added

- Periodically send the game state to Neuro over a WebSocket connection.
    - This includes the currently held cookies, the current CPS, the CPS breakdown by building, and part of the contents
      of the store.
    - The game state is sent every 5 seconds. This is not configurable currently, but it will be in a future update.
- Reconnect functionality to the WebSocket connection (currently hardcoded to 5 seconds).
- Allow Neuro to buy buildings and upgrades using the `buy_building` and `buy_upgrade` actions.
- Allow Neuro to click golden cookies using the `click_golden_cookie` action.
    - Neuro will treat reindeer as if they were golden cookies. A future update may distinguish between the two.
- An auto-clicker that clicks the big cookie 5 times per second while the WebSocket connection is active.
    - The click rate is not configurable currently, but it will be in a future update.
    - Clicks are simulated by dispatching a `click` event rather than actually controlling the mouse.
- A custom options menu entry for configuring the WebSocket address.
    - The WebSocket will automatically connect to the new address on subsequent launches of the game.
    - The options menu includes a button for quickly reloading the game to apply the changed settings.

[unreleased]: https://github.com/EnterpriseScratchDev/neuro-cookie-clicker/compare/v1.0.0...HEAD

[1.0.0]: https://github.com/EnterpriseScratchDev/neuro-cookie-clicker/releases/tag/v1.0.0
