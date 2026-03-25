# PR 6: Secondary Mini-Player Modes

This document summarizes the sixth review-sized PR branch:

- branch: `pr/06-secondary-mini-player`
- base: `pr/05-grouped-volume-panel`

## Goal

Keep this PR focused on one coherent secondary-view feature:

- make the secondary mini-player configurable
- allow it to be hidden
- add a compact supporting layout for non-home views

This PR intentionally does **not** include the later padding / gap / polish adjustments from the local branch. Those are better kept separate from the functional change.

## Why

The large multi-player card already shows a secondary mini-player below non-home views, which is useful because it keeps transport controls available while the user browses search results, media browser content, queue items, or grouped-volume controls.

But the upstream behavior is rigid:

- it is always the embedded default mini-player when shown
- it can take up more space than some dashboards want
- there is no compact alternative
- there is no explicit option to suppress it on secondary views

This PR makes that area configurable while preserving the current default behavior.

## What changed

### New option: `hide_mini_player_on_secondary_views`

```yaml
options:
  hide_mini_player_on_secondary_views: true
```

Why:
Some layouts want secondary views to focus entirely on the active surface and reclaim that vertical space.

Behavior:

- when `true`, the secondary mini-player is not shown
- when omitted or `false`, existing behavior is preserved

### New option: `secondary_view_mini_player_mode`

```yaml
options:
  secondary_view_mini_player_mode: compact
```

Supported values:

- `default`
- `compact`
- `hidden`

Why:
The existing embedded mini-player is still useful for some dashboards, but others want a denser, more supportive control strip.

Behavior:

- `default` keeps the current embedded mini-player
- `compact` uses the new compact layout
- `hidden` suppresses the mini-player entirely

`hidden` overlaps somewhat with `hide_mini_player_on_secondary_views`, but it keeps the mode explicit in the same setting.

### New compact secondary mini-player

The compact mode is designed as a supporting strip rather than a second full player card.

It includes:

- artwork thumbnail on the left
- current title and subtitle/player context in the middle
- transport controls on the right
- inline compact volume-slider mode
- power button when the player is off

Why:
This keeps important transport and volume actions accessible without spending as much space as the embedded default mini-player.

## User-facing behavior

### Keep the current behavior

```yaml
options:
  secondary_view_mini_player_mode: default
```

- shows the existing embedded mini-player

### Use the compact mini-player

```yaml
options:
  secondary_view_mini_player_mode: compact
```

- shows the compact strip instead of the embedded default mini-player

### Hide it entirely

Either:

```yaml
options:
  hide_mini_player_on_secondary_views: true
```

or:

```yaml
options:
  secondary_view_mini_player_mode: hidden
```

### Example

```yaml
type: custom:mediocre-multi-media-player-card
entity_id: media_player.ma_basement_sonos
options:
  secondary_view_mini_player_mode: compact
  hide_mini_player_on_secondary_views: false
```

## Compatibility

This PR is additive and intended to be low-risk.

- existing cards keep the current behavior by default
- if the new options are omitted, the current embedded mini-player remains
- the new options are available in the multi-card schema
- legacy conversion paths preserve `hide_mini_player_on_secondary_views`

## Scope

This PR intentionally does **not** include:

- later spacing/padding polish for the compact mini-player
- grouped-volume-specific visual tuning
- MA Search / Library redesign
- later search/browser density work

Those should remain separate follow-up PRs.

## Files changed

Runtime/UI:

- [MediocreLargeMultiMediaPlayerCard.tsx](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/MediocreLargeMultiMediaPlayerCard/MediocreLargeMultiMediaPlayerCard.tsx)
- [MiniPlayer.tsx](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/MediocreLargeMultiMediaPlayerCard/components/MiniPlayer.tsx)

Schema/config plumbing:

- [config.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/types/config.ts)
- [getMediocreLegacyConfigToMultiConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMediocreLegacyConfigToMultiConfig.ts)
- [getMediocreMassiveLegacyConfigToMultiConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMediocreMassiveLegacyConfigToMultiConfig.ts)

Tests:

- [secondaryMiniPlayer.config.test.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/secondaryMiniPlayer.config.test.ts)

## Validation

Validated on this branch with:

- `yarn tsc --noEmit`
- `yarn test`
- `yarn build`

I also generated a `.gz` build artifact locally for Home Assistant testing.

## Notes

- the compact secondary mini-player is intentionally built from existing shared controls instead of depending on a nested external card
- this branch is stacked on top of PRs 1 through 5, so the branch includes those earlier changes even though the GitHub diff should only show the PR 6 slice
- the repo’s current Prettier GitHub check still appears to fail repo-wide on upstream `v0.30.0`, independent of this PR
