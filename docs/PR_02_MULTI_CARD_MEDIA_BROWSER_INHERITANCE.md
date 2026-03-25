# PR 2: Multi-Card Media Browser Inheritance

This document summarizes the second review-sized PR branch:

- branch: `pr/02-multi-card-config-inheritance`
- base: `pr/01-view-and-footer-options`

## Goal

Keep this PR narrow and focused on one practical gap in the current multi-player card behavior:

- allow a root-level `media_browser` block on the multi-player card
- have the selected player inherit that root media browser config when it does not define its own
- preserve per-player override behavior
- preserve `media_types` on media browser entries

This PR does **not** attempt to redesign Search, Browse Media, or Music Assistant behavior. It only makes multi-card media browser configuration behave more predictably.

## Why

On the current upstream `v0.30.0` code, the large footer decides whether to show the Browse Media tab based on `selectedPlayer.media_browser`.

That means a multi-player card like this:

```yaml
type: custom:mediocre-multi-media-player-card
entity_id: media_player.ma_basement_sonos
media_browser:
  enabled: true
  media_types:
    - media_type: playlists
    - media_type: artists
media_players:
  - entity_id: media_player.ma_basement_sonos
```

looks like it has a root-level media browser configured, but the selected player never sees it.

In practice, that makes the Browse Media tab disappear unless `media_browser` is duplicated onto the selected player entry.

That is awkward for users and inconsistent with how a multi-card-level shared configuration is expected to behave.

## What changed

### Root-level `media_browser` is now allowed on multi-player cards

The multi-card schema now accepts a root `media_browser` block.

Why:
This makes the configuration shape match what users naturally expect when they want one shared media browser configuration for the card.

### Selected players inherit the root `media_browser` when needed

When a selected player does not define its own `media_browser`, it now falls back to the card-level `media_browser`.

Why:
This is the actual runtime fix that makes the footer Browse Media tab appear for shared multi-card configurations.

### Player-level media browser config still takes precedence

If a player defines its own `media_browser`, that player config still wins.

Why:
This preserves the ability to customize or narrow the media browser per player.

### Player-level disable behavior is preserved

If a player explicitly sets:

```yaml
media_browser: []
```

that still disables the media browser for that player.

Why:
An explicit player-level opt-out should continue to override the shared card-level default.

### `media_types` are preserved on media browser entries

The helper that normalizes media browser entries now carries `media_types` through for legacy-style media browser config.

Why:
Without this, root-level media browser config could exist but lose its filtering information during normalization.

## User-facing result

This now works as expected:

```yaml
type: custom:mediocre-multi-media-player-card
entity_id: media_player.ma_basement_sonos
media_browser:
  enabled: true
  media_types:
    - media_type: playlists
    - media_type: artists
media_players:
  - entity_id: media_player.ma_basement_sonos
  - entity_id: media_player.ma_dining_sl
    media_browser: []
```

Behavior:

- `ma_basement_sonos` inherits the root media browser config
- `ma_dining_sl` disables it explicitly
- the large footer shows Browse Media for the selected player when that player resolves to a usable media browser config

## Compatibility

This PR is intended to be additive and low-risk:

- existing cards that already define `media_browser` per player keep working
- player-level `media_browser` still wins
- `media_browser: []` still works as a player-level disable
- cards that do not use root-level `media_browser` are unaffected

## Scope

This PR intentionally does **not** include:

- root-level `search` inheritance
- MA Search / Global Search / Library redesign
- footer icon/title options beyond PR 1
- volume trailing button work
- favorite controls
- grouped volume panel
- compact mini-player work

Those should remain separate PRs.

## Files changed

Runtime:

- [SelectedPlayerContext.tsx](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/SelectedPlayerContext/SelectedPlayerContext.tsx)
- [getResolvedMultiMediaPlayer.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getResolvedMultiMediaPlayer.ts)
- [getMediaBrowserEntryArray.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMediaBrowserEntryArray.ts)

Schema/plumbing:

- [config.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/types/config.ts)
- [index.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/index.ts)

Tests:

- [getResolvedMultiMediaPlayer.test.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getResolvedMultiMediaPlayer.test.ts)
- [getMediaBrowserEntryArray.test.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMediaBrowserEntryArray.test.ts)

## Validation

Validated on this branch with:

- `yarn tsc --noEmit`
- `yarn test getResolvedMultiMediaPlayer getMediaBrowserEntryArray`
- `yarn build`

Note:

- upstream `v0.30.0` still builds successfully here with `yarn build`
- Vite warns that local Node is `20.11.0` while it prefers `20.19+`, but the build completed successfully
