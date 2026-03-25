# PR 1: Large View Footer And Title Options

This document summarizes the first review-sized PR branch:

- branch: `pr/01-view-and-footer-options`
- base: upstream `v0.30.0`

## Goal

Keep this PR narrow and low-risk.

It only adds a few large-card display options:

- configurable footer icon for the main player tab
- configurable footer icon for the Browse Media tab
- configurable title for the large Search view
- configurable title for the large Browse Media view
- optional forcing of the large footer `...` button

No Music Assistant search/library refactor, favorite control, grouped volume panel, or mini-player work is included in this PR.

## User-Facing Additions

New large-card options:

```yaml
options:
  player_view_icon: mdi:play
  media_browser_view_icon: mdi:bookshelf
  search_view_title: Global Search
  media_browser_view_title: Browse Media
  always_show_footer_more_actions: true
```

### `player_view_icon`

- changes the footer icon for the main player/home tab
- default remains `mdi:home`

### `media_browser_view_icon`

- changes the footer icon for the Browse Media tab
- default remains `mdi:folder-music`

### `search_view_title`

- overrides the large Search view title
- if omitted, existing translated/default titles are preserved

### `media_browser_view_title`

- overrides the large Browse Media view title
- if omitted, the existing translated/default title is preserved

### `always_show_footer_more_actions`

- forces the footer `...` button to remain visible even when there are no multiple custom buttons
- intended for setups that still want access to the additional-actions screen

## Behavior Notes

Footer behavior after this PR:

- if there is exactly one custom button, it is shown directly
- if there are multiple custom buttons, the footer `...` button is shown
- if `always_show_footer_more_actions: true`, the footer `...` button is shown even without multiple custom buttons
- MA-specific features no longer implicitly force the footer `...` button by themselves in this slice

Icon handling:

- blank or whitespace-only configured icon strings fall back to the existing defaults

## Compatibility

This PR is designed to preserve existing behavior unless the new options are used.

- existing cards do not need YAML changes
- omitted options preserve current defaults
- legacy conversion paths now carry these new options through where applicable

## Files Changed

Primary runtime changes:

- [FooterActions.tsx](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/MediocreLargeMultiMediaPlayerCard/components/FooterActions.tsx)
- [SearchView.tsx](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/MediocreLargeMultiMediaPlayerCard/components/SearchView.tsx)
- [MediaBrowserView.tsx](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/components/MediocreLargeMultiMediaPlayerCard/components/MediaBrowserView.tsx)

Config/schema plumbing:

- [config.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/types/config.ts)
- [cardConfigUtils.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/cardConfigUtils.ts)
- [getMediocreLegacyConfigToMultiConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMediocreLegacyConfigToMultiConfig.ts)
- [getMediocreMassiveLegacyConfigToMultiConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMediocreMassiveLegacyConfigToMultiConfig.ts)
- [getMultiConfigToMediocreMassiveConfig.ts](/g:/Documents/Code%202025/repos/mediocre-hass-media-player-cards/src/utils/getMultiConfigToMediocreMassiveConfig.ts)

## Validation

Validated on this branch with:

- `yarn tsc --noEmit`
- `yarn build`

Note:

- upstream `v0.30.0` no longer includes the local `build:ha` gzip helper, so validation on this branch used upstream `yarn build`

## Out Of Scope

Explicitly not included in PR 1:

- volume trailing button enhancements
- MA favorite control / artwork favorite overlay
- grouped volume panel
- MA Search / Global Search / Library redesign
- compact secondary mini-player work
