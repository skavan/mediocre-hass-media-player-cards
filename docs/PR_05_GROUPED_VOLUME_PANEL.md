# PR 5: Grouped Volume Panel

This document summarizes the fifth review-sized PR branch:

- branch: `pr/05-grouped-volume-panel`
- base: `pr/04-ma-favorite-control`

## Goal

Keep this PR focused on one coherent grouped-volume feature set:

- add a dedicated grouped volume panel to the large multi-player card
- allow the large volume-row trailing button to open that panel
- support per-player volume-panel config
- support optional power buttons per endpoint row

This PR intentionally focuses on grouped-volume control only. It does **not** include compact mini-player work or the later MA Search / Library redesign.

## Why

The large multi-player card already makes it easy to control playback for the selected player, but that does not solve the common grouped-audio problem:

- the selected player may represent one endpoint in a larger group
- a receiver or AVR may sit behind that player and need its own volume and power controls
- users often need one place to adjust all relevant endpoints without leaving the player

This PR adds that missing grouped-volume surface.

## What changed

### New large-card trailing button mode: `group_volume`

```yaml
options:
  volume_trailing_button: group_volume
```

Why:
The right side of the large volume row is the most natural entry point for grouped-volume controls.

### New per-player `volume_panel` config

Supported shape in this PR:

```yaml
media_players:
  - entity_id: media_player.ma_basement_sonos
    volume_panel:
      show_when: always
      entities:
        - entity_id: media_player.ma_basement_sonos
          name: Sonos
        - entity_id: media_player.sc_lx704
          name: Receiver
          show_power: true
```

Supported fields:

- `show_when`
  - `grouped`
  - `always`
- `entities`
- legacy `groups` shape is still accepted and flattened
- per-entity:
  - `entity_id`
  - `name`
  - `icon`
  - `show_power`
  - `power_entity_id`

Why:
Different selected players often need different grouped-volume endpoints.

### New large-card route: `Group Volume`

This PR adds a dedicated grouped-volume view to the large card.

Behavior:

- the selected player is shown first
- other grouped entities follow in runtime group order
- each configured row can show:
  - icon
  - name
  - current volume
  - mute state
  - optional power button
  - mute button
  - volume slider

Why:
This gives grouped setups a clear, task-specific control surface rather than trying to overload the main player view.

### New custom action: `mmpc-action: open-volume-panel`

This PR also adds an explicit internal action:

```yaml
tap_action:
  action: mmpc-action
  mmpc_action: open-volume-panel
```

Why:
This keeps the grouped-volume panel reusable from custom buttons or future launch paths without hardcoding every entry point.

## User-facing behavior

### `show_when: always`

```yaml
volume_panel:
  show_when: always
  entities:
    - entity_id: media_player.ma_basement_sonos
      name: Sonos
```

- panel is available even when the selected player is not currently grouped

### `show_when: grouped`

```yaml
volume_panel:
  show_when: grouped
  entities:
    - entity_id: media_player.ma_basement_sonos
      name: Sonos
```

- panel is only available when the selected player is currently grouped

If `show_when` is omitted, the behavior is the same as `grouped`.

### Per-row power support

```yaml
entities:
  - entity_id: media_player.sc_lx704
    name: Receiver
    show_power: true
```

- adds a power button for that row
- if `power_entity_id` is omitted, the row’s own `entity_id` is used

### Example: trailing-button launcher

```yaml
type: custom:mediocre-multi-media-player-card
entity_id: media_player.ma_basement_sonos
options:
  volume_trailing_button: group_volume
media_players:
  - entity_id: media_player.ma_basement_sonos
    can_be_grouped: true
    volume_panel:
      show_when: always
      entities:
        - entity_id: media_player.ma_basement_sonos
          name: Sonos
        - entity_id: media_player.sc_lx704
          name: Receiver
          show_power: true
```

### Example: custom-button launcher

```yaml
media_players:
  - entity_id: media_player.ma_basement_sonos
    custom_buttons:
      - icon: mdi:volume-source
        name: Group Volume
        tap_action:
          action: mmpc-action
          mmpc_action: open-volume-panel
```

## Compatibility

This PR is additive and intended to be low-risk.

- existing cards do not need YAML changes
- existing trailing-button behavior is unchanged unless `group_volume` is selected
- legacy nested `volume_panel.groups` config is still accepted
- per-player `volume_panel` config remains player-specific

## Scope

This PR intentionally does **not** include:

- compact secondary mini-player work
- MA Global Search / Library redesign
- later spacing / gap / density polish

Those should remain in follow-up PRs.

## Files changed

Runtime/UI:

- [MediocreLargeMultiMediaPlayerCard.tsx](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/MediocreLargeMultiMediaPlayerCard/MediocreLargeMultiMediaPlayerCard.tsx)
- [MassiveView.tsx](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/MediocreLargeMultiMediaPlayerCard/components/MassiveView.tsx)
- [VolumePanelView.tsx](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/MediocreLargeMultiMediaPlayerCard/components/VolumePanelView.tsx)
- [index.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/MediocreLargeMultiMediaPlayerCard/components/index.ts)

Schema/config/action plumbing:

- [config.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/types/config.ts)
- [actionTypes.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/types/actionTypes.ts)
- [actions.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/actions.ts)
- [cardConfigUtils.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/cardConfigUtils.ts)
- [getMediocreLegacyConfigToMultiConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMediocreLegacyConfigToMultiConfig.ts)
- [getMediocreMassiveLegacyConfigToMultiConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMediocreMassiveLegacyConfigToMultiConfig.ts)
- [getMultiConfigToMediocreMassiveConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMultiConfigToMediocreMassiveConfig.ts)

Tests:

- [groupVolumePanel.config.test.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/groupVolumePanel.config.test.ts)
- [actions.mmpcAction.test.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/actions.mmpcAction.test.ts)

## Validation

Validated on this branch with:

- `yarn tsc --noEmit`
- `yarn test`
- `yarn build`

I also generated a `.gz` build artifact locally for Home Assistant testing.

## Notes

- the selected player is intentionally shown first in the grouped-volume panel
- `show_when: always` is useful for setups where the user wants a stable grouped-volume entry point even before grouping is active
- the repo’s current Prettier GitHub check still appears to fail repo-wide on upstream `v0.30.0`, independent of this PR
