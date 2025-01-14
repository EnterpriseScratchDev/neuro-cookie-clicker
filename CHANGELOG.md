# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.2] - 2025-01-14

This hasn't been pushed to the Steam Workshop yet.

### Fixed

- Fixed a bug with the tracking of shimmers (golden cookies and reindeer).
  Prior to this fix, Neuro likely would have thought there was always a golden cookie on the screen once one had first
  appeared.

## [1.1] - 2025-01-13

Pushed to the Steam Workshop on 2025-01-13.

### Added

- Created a framework for configuring what's included in the context sent to Neuro.
  Minor changes to existing behavior were made during the process of creating this.
- Add a backoff mechanism to the WebSocket connection.
- Include the new cookie balance in the result message when buying a building or upgrade.
- Tell Neuro how many of each building she can afford when sending the store context.
  When testing with Jippity, including this information encouraged him to buy more buildings.
- Make it clear to Neuro when an error occurred when trying to buy a building or upgrade.
  Surely an error would never actually occur. Surely.

### Changed

- Improved the readability of the context sent to Neuro.
- Changed the auto-clicker interval to 500ms
- Changed the maximum number of buildings in the store context to 5

### Fixed

- Fixed a bug where the cookies-per-second-by-building data wasn't being included in the context sent to Neuro.

## [1.0] - 2025-01-12

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

[unreleased]: https://github.com/EnterpriseScratchDev/neuro-cookie-clicker/compare/v1.2...HEAD
[1.2]: https://github.com/EnterpriseScratchDev/neuro-cookie-clicker/compare/v1.1...v1.2
[1.1]: https://github.com/EnterpriseScratchDev/neuro-cookie-clicker/compare/v1.0...v1.1
[1.0]: https://github.com/EnterpriseScratchDev/neuro-cookie-clicker/releases/tag/v1.0
