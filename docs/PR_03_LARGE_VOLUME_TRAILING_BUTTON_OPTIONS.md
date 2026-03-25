# PR 3: Large Volume Trailing Button Options

This document summarizes the third review-sized PR branch:

- branch: `pr/03-large-volume-actions`
- base: `pr/02-multi-card-config-inheritance`

## Goal

Keep this PR focused on one small but useful customization point in the large player view:

- make the button to the right of the large volume slider configurable
- support a custom action button there
- allow hiding that trailing button entirely

This PR is intentionally the generic foundation only. It does **not** include the later Music Assistant favorite button behavior or grouped volume panel behavior that were built on top of it locally.

## Why

On the current upstream implementation, the large player view always renders a power button to the right of the volume slider.

That is simple, but it is also fairly rigid:

- some setups want that position to trigger a custom action instead
- some setups do not want a trailing button there at all
- later features like MA favorites or grouped volume controls need a clean, explicit slot to build on

This PR adds that slot in a deliberately narrow way without changing the default behavior.

## What changed

### New large-card option: `volume_trailing_button`

Supported values in this PR:

- `power`
- `custom`
- `none`

Example:

```yaml
options:
  volume_trailing_button: custom
```

Why:
This turns an always-fixed trailing control into an explicit configuration choice.

### New per-player field: `volume_trailing_button_custom_button`

When `volume_trailing_button: custom` is used, the selected player can supply the custom button definition:

```yaml
media_players:
  - entity_id: media_player.living_room
    volume_trailing_button_custom_button:
      icon: mdi:heart
      name: Favorite
      tap_action:
        action: toggle
```

Why:
The trailing control is tied to the selected player in the large multi-player card, so the custom action should also be player-specific.

This field uses the same `CustomButton` shape that the card already uses elsewhere for `custom_buttons[]`.

In practice that means:

- `icon` is required
- `name` is required
- the action is defined using the existing action config blocks, such as `tap_action`, `hold_action`, and `double_tap_action`

So the mental model is:

- `custom_buttons[]` adds buttons to the custom-buttons area
- `volume_trailing_button_custom_button` adds one button specifically to the right side of the large volume row

### How to use `custom`

To use the custom mode, two things must be present:

1. set the card-level option:

```yaml
options:
  volume_trailing_button: custom
```

2. define the per-player button:

```yaml
media_players:
  - entity_id: media_player.living_room
    volume_trailing_button_custom_button:
      icon: mdi:heart
      name: Favorite
      tap_action:
        action: toggle
```

If the card is in `custom` mode but the selected player does not define `volume_trailing_button_custom_button`, there is no custom trailing button to render for that player.

### Example: different custom buttons per player

Because the button is defined per player, different players can expose different actions in the same trailing-button slot:

```yaml
type: custom:mediocre-multi-media-player-card
entity_id: media_player.living_room
media_players:
  - entity_id: media_player.living_room
    volume_trailing_button_custom_button:
      icon: mdi:heart
      name: Favorite
      tap_action:
        action: toggle

  - entity_id: media_player.kitchen
    volume_trailing_button_custom_button:
      icon: mdi:television
      name: TV
      tap_action:
        action: more-info

options:
  volume_trailing_button: custom
```

That keeps the slot generic in this PR while still making it useful immediately.

### Default behavior is preserved

If `volume_trailing_button` is omitted, the large player view still shows the existing power button.

Why:
This keeps the PR low-risk for existing users.

## User-facing behavior

### `power`

```yaml
options:
  volume_trailing_button: power
```

- current/default behavior
- shows the power button to the right of the volume slider

### `custom`

```yaml
options:
  volume_trailing_button: custom

media_players:
  - entity_id: media_player.living_room
    volume_trailing_button_custom_button:
      icon: mdi:heart
      name: Favorite
      tap_action:
        action: toggle
```

- replaces the trailing power button with the configured custom button
- reuses the existing custom-button action plumbing
- expects the same button shape as an entry in `custom_buttons[]`
- is resolved from the currently selected player in the multi-player card

### `none`

```yaml
options:
  volume_trailing_button: none
```

- removes the trailing button entirely

## Compatibility

This PR is designed to be additive:

- existing cards keep the current power-button behavior by default
- the new fields are optional
- legacy conversion paths preserve the new option where relevant
- popup / large-card conversion keeps the selected player's trailing button config

## Scope

This PR intentionally does **not** include:

- `ma_favorite` as a trailing button type
- grouped volume panel launch from the trailing button
- grouped volume panel config
- artwork favorite overlay
- compact secondary mini-player work
- MA Search / Library changes

Those should remain separate follow-up PRs.

## Files changed

Runtime:

- [MassiveView.tsx](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/MediocreLargeMultiMediaPlayerCard/components/MassiveView.tsx)

Schema/config plumbing:

- [config.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/types/config.ts)
- [cardConfigUtils.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/cardConfigUtils.ts)
- [getMediocreLegacyConfigToMultiConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMediocreLegacyConfigToMultiConfig.ts)
- [getMediocreMassiveLegacyConfigToMultiConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMediocreMassiveLegacyConfigToMultiConfig.ts)
- [getMultiConfigToMediocreMassiveConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMultiConfigToMediocreMassiveConfig.ts)

Tests:

- [cardConfigUtils.trailingButton.test.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/cardConfigUtils.trailingButton.test.ts)
- [cardConfigUtils.test.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/cardConfigUtils.test.ts)
- [getMediocreLegacyConfigToMultiConfig.test.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMediocreLegacyConfigToMultiConfig.test.ts)
- [getMultiConfigToMediocreMassiveConfig.test.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMultiConfigToMediocreMassiveConfig.test.ts)

## Validation

Validated on this branch with:

- `yarn tsc --noEmit`
- `yarn test`
- `yarn build`

Note:

- the repo's current Prettier GitHub check appears to fail repo-wide on upstream `v0.30.0`, independent of this PR
- Vite warns locally that Node `20.11.0` is below its preferred version, but the build completed successfully
