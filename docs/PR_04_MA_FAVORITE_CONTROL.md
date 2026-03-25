# PR 4: Music Assistant Favorite Control

This document summarizes the fourth review-sized PR branch:

- branch: `pr/04-ma-favorite-control`
- base: `pr/03-large-volume-actions`

## Goal

Keep this PR focused on one coherent Music Assistant feature:

- add a stateful favorite/unfavorite control for the currently playing MA item
- allow that control to appear as an overlay on the main artwork
- optionally allow that control to appear on the large view volume row

This PR intentionally builds on the generic trailing-button foundation from PR 3 rather than mixing in grouped volume or broader MA search/library work.

## Why

The card already had `ma_favorite_button_entity_id`, but that only exposed a simple "press the favorite button" action in the additional-actions area.

That was useful, but incomplete:

- it did not show whether the current item was already favorited
- it was not available in the main large-view control surface
- it did not support removing a favorite when Music Assistant exposed enough information to do so

This PR turns that one-way action into a real MA favorite control.

## What changed

### New root config block: `ma_favorite_control`

Supported fields in this PR:

- `enabled`
- `active_icon`
- `inactive_icon`
- `active_color`
- `show_on_artwork`
- `artwork_button_size`
- `artwork_inset_top`
- `artwork_inset_right`

Example:

```yaml
ma_favorite_control:
  show_on_artwork: true
  artwork_button_size: medium
  artwork_inset_top: 14px
  artwork_inset_right: 14px
  active_icon: mdi:star
  inactive_icon: mdi:star-outline
  active_color: "#f2c94c"
```

Why:
This keeps the MA favorite behavior configurable without introducing unrelated UI changes.

### New large-card trailing button mode: `ma_favorite`

PR 3 introduced the generic trailing-button slot on the large volume row.

This PR adds a Music Assistant-specific use of that slot:

```yaml
options:
  volume_trailing_button: ma_favorite
```

Why:
Artwork is the most natural place for this control. The volume-row placement is a secondary option that may work well for some layouts, especially if the user wants the favorite control in the same area as the rest of the primary transport/volume controls.

### New stateful MA favorite button component/hook

This PR adds a dedicated `MaFavoriteButton` and `useMaFavoriteControl` hook.

Behavior:

- reads current queue state from `music_assistant.get_queue`
- shows active/inactive icon state based on the current item
- adds a favorite by pressing `ma_favorite_button_entity_id`
- removes a favorite via `mass_queue.unfavorite_current_item` when the current item is a library item

Why:
This makes the MA favorite control reflect actual state instead of behaving like a blind one-way action.

## User-facing behavior

### Prerequisites

For the control to appear, the selected player needs:

- `ma_entity_id`
- `ma_favorite_button_entity_id`

and the player must resolve as having Music Assistant features.

### Artwork overlay

If configured:

```yaml
ma_favorite_control:
  show_on_artwork: true
```

the favorite button appears as an overlay on the large artwork.

This is the primary placement this PR is designed around. The icon, color, size, and inset can all be configured.

### Volume-row trailing button

If configured:

```yaml
options:
  volume_trailing_button: ma_favorite
```

the large view shows the MA favorite control to the right of the volume slider instead of the power button.

### Add vs remove behavior

If the current item is not favorited:

- pressing the control adds it as a favorite using the configured MA favorite button entity

If the current item is already favorited and Music Assistant identifies it as a library item:

- pressing the control removes it from favorites

If the current item is already favorited but is not removable through the currently available MA queue metadata:

- the control remains visible
- the user gets an explanatory tooltip/title stating that unfavorite is only supported for library items right now

## Example

```yaml
type: custom:mediocre-multi-media-player-card
entity_id: media_player.ma_basement_sonos
ma_favorite_control:
  show_on_artwork: true
  artwork_button_size: medium
  artwork_inset_top: 14px
  artwork_inset_right: 14px
  active_icon: mdi:star
  inactive_icon: mdi:star-outline
  active_color: "#f2c94c"
options:
  volume_trailing_button: ma_favorite
media_players:
  - entity_id: media_player.ma_basement_sonos
    ma_entity_id: media_player.ma_basement_sonos
    ma_favorite_button_entity_id: button.ma_basement_favorite_current_song
```

## Compatibility

This PR is intended to be additive and low-risk.

- existing cards do not need YAML changes
- existing `ma_favorite_button_entity_id` usage still works
- if `ma_favorite_control` is omitted, nothing new is shown
- if `volume_trailing_button` is omitted, the large card still keeps its current trailing-button behavior

## Stacking note

This branch is stacked on top of PRs 1 through 3.

That means:

- the branch itself includes the earlier PR changes
- the GitHub PR diff should be based on `pr/03-large-volume-actions`
- GitHub will only show the new PR 4 changes, not re-show the earlier stacked changes

## Scope

This PR intentionally does **not** include:

- grouped volume panel
- `group_volume` trailing button mode
- compact secondary mini-player work
- MA Global Search / Library redesign
- later visual polish tweaks

Those should remain in follow-up PRs.

## Files changed

Runtime/UI:

- [AlbumArt.tsx](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/AlbumArt/AlbumArt.tsx)
- [MassiveView.tsx](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/MediocreLargeMultiMediaPlayerCard/components/MassiveView.tsx)
- [MaFavoriteButton.tsx](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/MaFavoriteButton/MaFavoriteButton.tsx)
- [useMaFavoriteControl.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/hooks/useMaFavoriteControl.ts)

Schema/config plumbing:

- [config.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/types/config.ts)
- [cardConfigUtils.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/cardConfigUtils.ts)
- [getMediocreLegacyConfigToMultiConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMediocreLegacyConfigToMultiConfig.ts)
- [getMediocreMassiveLegacyConfigToMultiConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMediocreMassiveLegacyConfigToMultiConfig.ts)
- [getMultiConfigToMediocreMassiveConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMultiConfigToMediocreMassiveConfig.ts)
- [index.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/index.ts)
- [index.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/hooks/index.ts)

Tests:

- [maFavoriteControl.config.test.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/maFavoriteControl.config.test.ts)

## Validation

Validated on this branch with:

- `yarn tsc --noEmit`
- `yarn test`
- `yarn build`

I also generated a `.gz` build artifact locally for Home Assistant testing.

## Notes

- the control relies on Music Assistant queue metadata to know whether the current item is already favorited
- removing favorites is currently limited to items Music Assistant identifies as library items
- the repo's current Prettier GitHub check still appears to fail repo-wide on upstream `v0.30.0`, independent of this PR
