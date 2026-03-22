# Local Additions Reference

This document captures the local additions made in this repo during this round of changes.

It covers:

- Home Assistant media browser root filtering
- root-level multi-card inheritance for `media_browser`
- configurable large-card player tab icon
- configurable large-card trailing volume button
- reusable Music Assistant favorite control
- Music Assistant artwork favorite overlay
- Music Assistant search filter configuration and favorites
- local build helpers for Home Assistant deployment

## 1. Media Browser Root Filtering

The Home Assistant media browser now supports an optional root-level category allowlist.

Behavior:

- applies only to the first/root Browse Media screen
- if `media_types` is omitted, all root categories are shown
- if `media_types` is present, only those root categories are shown
- categories are shown in the same order as configured
- `name` and `icon` can override the displayed root tile

Supported root types:

- `artists`
- `albums`
- `tracks`
- `playlists`
- `radios`

Example:

```yaml
media_browser:
  enabled: true
  media_types:
    - media_type: artists
    - media_type: albums
    - media_type: tracks
    - media_type: playlists
    - media_type: radios
      name: Radio Stations
      icon: mdi:radio
```

## 2. Multi-Card `media_browser` Inheritance

For `type: custom:mediocre-multi-media-player-card`:

- root-level `media_browser` applies to all players by default
- a player-level `media_browser` overrides the root-level config
- `media_browser: []` disables media browser for that player

Example:

```yaml
type: custom:mediocre-multi-media-player-card
media_browser:
  enabled: true
  media_types:
    - media_type: artists
    - media_type: albums
    - media_type: tracks
    - media_type: playlists
    - media_type: radios
media_players:
  - entity_id: media_player.ma_basement_sonos
  - entity_id: media_player.ma_dining_sl
    media_browser: []
```

## 3. Large Card Player View Icon

The first footer/tab icon on the large player can now be customized.

Option:

- `options.player_view_icon`

Default:

- `mdi:home`

Example:

```yaml
options:
  player_view_icon: mdi:play
```

## 4. Large Card Media Browser Icon

The media browser footer/tab icon on the large player can now be customized.

Option:

- `options.media_browser_view_icon`

Default:

- `mdi:folder-music`

Example:

```yaml
options:
  media_browser_view_icon: mdi:folder-star
```

## 5. Footer More-Actions Button

The large footer `...` button now behaves like this:

- by default it only shows when multiple `custom_buttons` are defined
- if exactly one `custom_button` is defined, that button is shown directly
- it no longer appears just because a player has MA features
- you can force it to show for access to the additional-actions view

Option:

- `options.always_show_footer_more_actions`

Example:

```yaml
options:
  always_show_footer_more_actions: true
```

## 6. Large Card Volume Trailing Button

The large player view now supports a configurable button to the right of the volume slider.

Option:

- `options.volume_trailing_button`

Supported values:

- `power`
- `ma_favorite`
- `custom`
- `none`

Compatibility:

- `favorite` is still accepted as a compatibility alias for `ma_favorite`

### Custom trailing button

When using `custom`, configure:

- `volume_trailing_button_custom_button`

This uses the same shape as a single entry from `custom_buttons`.

Example:

```yaml
options:
  volume_trailing_button: custom

media_players:
  - entity_id: media_player.ma_basement_sonos
    volume_trailing_button_custom_button:
      icon: mdi:heart-plus
      name: Favorite
      tap_action:
        action: perform-action
        perform_action: button.press
        target:
          entity_id: button.ma_basement_favorite_current_song
```

## 7. Music Assistant Favorite Control

A reusable Music Assistant favorite control is now available.

Root config:

- `ma_favorite_control`

Supported options:

- `enabled`
- `active_icon`
- `inactive_icon`
- `active_color`
- `show_on_artwork`
- `artwork_button_size`
- `artwork_inset_top`
- `artwork_inset_right`

### Runtime requirements

The selected player should provide:

- `ma_entity_id`
- `ma_favorite_button_entity_id`

### Behavior

- favorite state is read from `music_assistant.get_queue`
- add favorite uses the configured `ma_favorite_button_entity_id`
- remove favorite uses `mass_queue.unfavorite_current_item`
- provider-backed items may report favorite state but currently cannot always be unfavorited through this path

Example:

```yaml
ma_favorite_control:
  active_icon: mdi:star
  inactive_icon: mdi:star-outline
  active_color: "#f2c94c"
```

## 8. Artwork Favorite Overlay

The Music Assistant favorite control can be shown on the main artwork.

Options:

- `ma_favorite_control.show_on_artwork`
- `ma_favorite_control.artwork_button_size`
- `ma_favorite_control.artwork_inset_top`
- `ma_favorite_control.artwork_inset_right`

Size values:

- `xx-small`
- `x-small`
- `small`
- `medium`
- `large`

Inset values:

- any valid CSS length or inset value such as `14px`, `1rem`, `5%`, or `calc(1rem + 4px)`

Example:

```yaml
ma_favorite_control:
  show_on_artwork: true
  artwork_button_size: medium
  artwork_inset_top: "2%"
  artwork_inset_right: "8%"
  active_icon: mdi:star
  inactive_icon: mdi:star-outline
  active_color: "#f2c94c"
```

## 9. Music Assistant Search Configuration

If a search entry targets the player's `ma_entity_id`, it is now treated as a configurable Music Assistant search provider.

This allows the existing `search.media_types` YAML shape to drive `MaSearch`.

Behavior:

- Music Assistant favorites are shown when the query is blank
- typed queries use `music_assistant.search`
- blank queries use `music_assistant.get_library` with `favorite: true`
- if a configured search entry already targets `ma_entity_id`, the synthetic duplicate MA provider is not added

### Supported `media_type` aliases for MA search

- `all`
- `music`
- `artist`
- `artists`
- `album`
- `albums`
- `track`
- `tracks`
- `playlist`
- `playlists`
- `radio`
- `radios`
- `audiobook`
- `audiobooks`
- `podcast`
- `podcasts`

Special behavior:

- `music` is treated as an aggregate of `artist`, `album`, and `track`
- if custom MA filters are provided, `All` is still prepended unless explicitly included

Example:

```yaml
search:
  - entity_id: media_player.ma_basement_sonos
    name: MA Basement Sonos
    media_types:
      - media_type: music
        name: Music
        icon: mdi:music
      - media_type: playlist
        name: Playlists
        icon: mdi:playlist-music
```

With the example above:

- `All` shows all MA favorites
- `Music` shows favorite artists, albums, and tracks
- `Playlists` shows favorite playlists
- typed search under `Music` searches artist, album, and track in MA

## 10. Build Helpers

Added package scripts:

- `yarn gzip:dist`
- `yarn build:ha`

Recommended command:

```bash
yarn build:ha
```

This produces:

- `dist/mediocre-hass-media-player-cards.js`
- `dist/mediocre-hass-media-player-cards.js.gz`

## 11. Combined Example

```yaml
type: custom:mediocre-multi-media-player-card
entity_id: media_player.ma_basement_sonos
size: large
mode: card
use_art_colors: true

media_browser:
  enabled: true
  media_types:
    - media_type: artists
    - media_type: albums
    - media_type: tracks
    - media_type: playlists
    - media_type: radios

options:
  always_show_footer_more_actions: true
  media_browser_view_icon: mdi:folder-star
  player_view_icon: mdi:play
  volume_trailing_button: ma_favorite

ma_favorite_control:
  show_on_artwork: true
  artwork_button_size: medium
  artwork_inset_top: "2%"
  artwork_inset_right: "8%"
  active_icon: mdi:star
  inactive_icon: mdi:star-outline
  active_color: "#f2c94c"

media_players:
  - entity_id: media_player.ma_basement_sonos
    ma_entity_id: media_player.ma_basement_sonos
    ma_favorite_button_entity_id: button.ma_basement_favorite_current_song
    search:
      - entity_id: media_player.ma_basement_sonos
        name: MA Basement Sonos
        media_types:
          - media_type: music
            name: Music
            icon: mdi:music
          - media_type: playlist
            name: Playlists
            icon: mdi:playlist-music
  - entity_id: media_player.ma_dining_sl
    media_browser: []
    search: []
```

## 12. Current Limitations

- Home Assistant media browser root filtering only affects the first/root Browse Media screen
- Music Assistant unfavorite currently depends on `mass_queue.unfavorite_current_item`, which is limited for some provider-backed items
- Music Assistant search favorites are exposed through the search view, not the media browser
- the forced `All` MA search chip still shows all MA favorite categories, not only the configured subset
