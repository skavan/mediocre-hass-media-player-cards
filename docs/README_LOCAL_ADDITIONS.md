# Local Additions Reference

This document captures the local additions made in this repo during this round of changes.

It focuses on user-facing YAML, runtime behavior, and the current limitations of those additions.

It covers:

- Home Assistant media browser root filtering
- root-level multi-card inheritance for `media_browser`
- configurable large-card footer icons and footer behavior
- configurable large-card trailing volume button
- native grouped volume panel
- optional hiding of the large-card mini player on secondary views
- reusable Music Assistant favorite control
- Music Assistant artwork favorite overlay
- Music Assistant library, favorites, and discovery views
- Home Assistant browser/search behavior vs Music Assistant behavior
- local build helpers for Home Assistant deployment

## 1. Home Assistant Media Browser Root Filtering

The Home Assistant-backed media browser now supports an optional root-level category allowlist.

Behavior:

- applies only to the first/root Browse Media screen
- if `media_types` is omitted, all root categories are shown
- if `media_types` is present, only those root categories are shown
- configured categories are shown in the same order as YAML
- `name` and `icon` can override the displayed root tile
- this path is still driven by Home Assistant `media_player/browse_media`, not by Music Assistant library APIs

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

## 3. Large Card Footer Options

The large-card footer now supports several additional options.

### Player view icon

Option:

- `options.player_view_icon`

Default:

- `mdi:home`

Example:

```yaml
options:
  player_view_icon: mdi:play
```

### Media browser view icon

Option:

- `options.media_browser_view_icon`

Default:

- `mdi:folder-music`

Example:

```yaml
options:
  media_browser_view_icon: mdi:folder-star
```

### Footer more-actions (`...`) behavior

The large footer `...` button now behaves like this:

- by default it only shows when multiple `custom_buttons` are defined
- if exactly one `custom_button` is defined, that button is shown directly
- it no longer appears just because a player has MA-specific features
- you can force it to show for access to the additional-actions view

Option:

- `options.always_show_footer_more_actions`

Example:

```yaml
options:
  always_show_footer_more_actions: true
```

### Hide mini player on secondary views

The large card can optionally hide the mini player shown below non-home views such as:

- Group Volume
- Search
- Media Browser
- Queue
- Speaker Grouping

Option:

- `options.hide_mini_player_on_secondary_views`

Example:

```yaml
options:
  hide_mini_player_on_secondary_views: true
```

### Secondary-view mini player mode

The large card can also switch the mini player shown below non-home views between the current embedded-card layout and a denser compact layout.

Option:

- `options.secondary_view_mini_player_mode`

Supported values:

- `default`
- `compact`
- `hidden`

Behavior:

- `default` preserves the existing embedded mini player
- `compact` uses a denser Mushroom-like two-line layout with artwork, truncation, compact transport buttons, and a final volume or power action button
- the compact layout uses a rounded artwork tile and tighter spacing than the embedded mini player
- `hidden` suppresses the secondary-view mini player
- `hide_mini_player_on_secondary_views: true` still takes precedence and hides it completely

Example:

```yaml
options:
  secondary_view_mini_player_mode: compact
```

### MA Search and Library density / title options

The large card now also supports MA-specific options for the Search and Browse Media surfaces.

Options:

- `options.search_view_title`
- `options.ma_search_thumbs_columns`
- `options.ma_search_compact_thumbs_columns`
- `options.ma_library_root_columns`
- `options.ma_library_thumbs_columns`
- `options.ma_library_compact_thumbs_columns`

Behavior:

- `search_view_title` overrides the large Search view title
- `ma_search_thumbs_columns` controls the Global Search `thumbs` grid
- `ma_search_compact_thumbs_columns` controls the Global Search `compact thumbs` grid
- `ma_library_root_columns` controls the root category tiles in the MA-backed Browse Media view
- `ma_library_thumbs_columns` controls MA library category pages in `thumbs` view
- `ma_library_compact_thumbs_columns` controls MA library category pages in `compact thumbs` view

Defaults:

- Search `thumbs`: `4`
- Search `compact thumbs`: `5`
- Library root tiles: `4`
- Library `thumbs`: `4`
- Library `compact thumbs`: `5`

Example:

```yaml
options:
  search_view_title: Global Search
  ma_search_thumbs_columns: 4
  ma_search_compact_thumbs_columns: 5
  ma_library_root_columns: 4
  ma_library_thumbs_columns: 4
  ma_library_compact_thumbs_columns: 5
```

## 4. Large Card Volume Trailing Button

The large player view supports a configurable button to the right of the volume slider.

Option:

- `options.volume_trailing_button`

Supported values:

- `power`
- `ma_favorite`
- `group_volume`
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

### Built-in grouped-volume trailing button

To open the native grouped-volume panel from the trailing volume-row button:

```yaml
options:
  volume_trailing_button: group_volume
```

Behavior:

- uses a built-in `mdi:volume-source` button on the right side of the large volume row
- opens the same native grouped-volume panel as the custom `mmpc-action`
- keeps the custom-button launch path available for other placements
- hides itself unless the panel is relevant for the selected player

## 5. Native Grouped Volume Panel

The large card now supports a native grouped-volume panel.

It reuses the same shared `VolumeSlider` behavior as the card's built-in volume row.

It can be opened from:

- `options.volume_trailing_button: group_volume`
- a custom button using `mmpc-action: open-volume-panel`
- a `volume_trailing_button_custom_button` using `mmpc-action: open-volume-panel`

### Custom button target

Use a custom button action like this:

```yaml
custom_buttons:
  - icon: mdi:volume-source
    name: Volumes
    tap_action:
      action: mmpc-action
      mmpc_action: open-volume-panel
```

This also works for `volume_trailing_button_custom_button`.

### Per-player config

Configure the selected player's native volume panel with:

- `volume_panel.show_when`
- `volume_panel.entities`

Supported `show_when` values:

- `grouped` (default)
- `always`

Each entity supports:

- `entity_id`
- `name`
- `icon`
- `show_power`
- `power_entity_id`

Compatibility:

- the older nested `volume_panel.groups` shape is still accepted and flattened into the player's section

Example:

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
  - entity_id: media_player.ma_dining_sl
    volume_panel:
      show_when: always
      entities:
        - entity_id: media_player.ma_dining_sl
          name: Dining
```

Behavior:

- the panel is available in the large-card view
- when `show_when` is `grouped`, the panel shows an explanatory message until the selected player is grouped
- the selected player is shown first
- other currently grouped players are appended after it
- each grouped player contributes its own `volume_panel.entities` section
- if a grouped player has no `volume_panel` config, it falls back to a single row for that player's main media entity
- each endpoint row shows the configured display name and the current volume percentage
- rows use the native slider behavior already used elsewhere in the card
- power buttons are optional per row

## 6. Music Assistant Favorite Control

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
- provider-backed items may report favorite state but cannot always be unfavorited through this path
- `options.volume_trailing_button: ma_favorite` reuses the same MA favorite runtime

Example:

```yaml
ma_favorite_control:
  active_icon: mdi:star
  inactive_icon: mdi:star-outline
  active_color: "#f2c94c"
```

## 7. Artwork Favorite Overlay

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

Behavior:

- the inactive overlay uses a translucent neutral background for contrast on light or dark artwork
- the active overlay uses a darker background so the active color stands out more clearly
- the overlay is inset from the artwork edge rather than sitting flush against the corner

Example:

```yaml
ma_favorite_control:
  show_on_artwork: true
  artwork_button_size: medium
  artwork_inset_top: "5%"
  artwork_inset_right: "6%"
  active_icon: mdi:star
  inactive_icon: mdi:star-outline
  active_color: "#f2c94c"
```

## 8. Music Assistant Global Search and Library

If a search entry targets the player's `ma_entity_id`, it is treated as a configurable Music Assistant search provider.

If a media browser entry targets the player's `ma_entity_id`, the large-card Browse Media tab uses a Music Assistant library view instead of the Home Assistant `browse_media` tree.

This allows the existing `search.media_types` and `media_browser.media_types` YAML shapes to drive the Music Assistant views.

### MA Search

The MA-backed Search tab is now a true `Global Search` surface.

Behavior:

- the old `Favorites | Library | Discover` mode row has been removed
- the page is query-first instead of mode-first
- the view title defaults to `Global Search` and can be overridden with `options.search_view_title`
- category chips still filter the search scope (`All`, `Tracks`, `Artists`, etc.)
- typed queries use `music_assistant.search`
- blank query shows grouped default results by category
- the overflow menu currently supports:
  - `Only show favorites`
  - `View Mode`
  - existing enqueue mode options
- when `Only show favorites` is enabled, the header area shows a filled-heart indicator

View density defaults:

- `list`: row list
- `thumbs`: `4` columns by default
- `compact thumbs`: `5` columns by default

The blank-query favorites toggle uses Music Assistant library data with `favorite: true`.

### MA Library / Browse Media

The MA-backed Browse Media tab is now a library-first surface.

Behavior:

- the root page starts with category tiles
- those root tiles are filtered by `media_browser.media_types`
- clicking a category opens that category page
- the category page supports:
  - scoped search within that category
  - `Only show favorites`
  - view mode switching
- when `Only show favorites` is enabled, the header area shows a filled-heart indicator

View density defaults:

- root category tiles: `4` columns by default
- category `list`: row list
- category `thumbs`: `4` columns by default
- category `compact thumbs`: `5` columns by default

Defaults:

- MA Search is Global Search
- MA Browse Media is Library

### Configurable MA media types

Supported `media_type` aliases for MA search and MA library views:

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
- `genre`
- `genres`
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
      - media_type: playlists
        name: Playlists
        icon: mdi:playlist-music
      - media_type: artists
        name: Artists
        icon: mdi:account-music
      - media_type: albums
        name: Albums
        icon: mdi:album
      - media_type: tracks
        name: Tracks
        icon: mdi:music-note
```

With the example above:

- `All` is still prepended automatically
- Global Search uses those chips as search-scope filters
- Browse Media uses those categories as root library tiles

### MA search and library UI behavior

The current MA search/library UI behaves like this:

- Global Search uses category chips only; it no longer has the old scope row
- Global Search has a vertical-dots menu for favorites-only, view mode, and enqueue controls
- Global Search remembers the selected view mode independently per category
- the favorites-only state is shown inline in the toolbar area instead of taking a full extra row
- Browse Media uses category tiles at the root and a breadcrumbed category page after selection
- Browse Media remembers the selected view mode independently per category page
- Browse Media also shows the favorites-only state inline in the toolbar area
- Search and Library both support:
  - `list`
  - `thumbs`
  - `compact thumbs`
- tracks no longer use a unique oversized full-row renderer in Search; Search and Library now share the same MA results renderer
- the search input shows a clear `x` when text is present
- when text is present, the clear `x` takes precedence over the spinner
- the category chips (`All`, `Artists`, `Albums`, etc.) are a single horizontal strip rather than a wrapped grid
- that strip is swipe-scrollable on touch devices and uses a thin horizontal scrollbar when needed

### Missing-artwork placeholders

When a Music Assistant item has no artwork:

- a shared placeholder helper now generates initials from the item name
- the UI shows a neutral grey tile with initials instead of a broken or empty image

This behavior is shared across MA media result tiles.

### MA provider de-duplication

If a configured search entry already targets `ma_entity_id`, the synthetic duplicate MA provider is not added.

That avoids the previous collision where HA and MA providers with the same entity could appear to be separate while actually resolving to the same MA path.

## 9. Home Assistant Search and Browser Behavior

The Home Assistant-backed paths are separate from the Music Assistant-backed search/library path.

### HA Browser

The standard Home Assistant-backed `Browse Media` view uses Home Assistant `media_player/browse_media` on the selected entity.

That means:

- it shows whatever that specific media player entity exposes through HA browsing
- it is not the same thing as Music Assistant library search
- a track existing in the MA library does not guarantee it will appear in the HA browser tree
- if the selected media browser entry is MA-backed, the card now uses the MA library view instead of this HA browse path

### HA Search

The Home Assistant search path behaves like this:

- blank query uses Home Assistant `media_player/browse_media`
- typed query uses Home Assistant `media_player/search_media`
- empty-query browse results are filtered to `can_play` items in the current implementation
- the search input includes the same clear `x` behavior as the MA input

So if you want reliable Music Assistant favorites, library items, and provider-wide discovery, the MA path is the authoritative one.

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
ma_entity_id: media_player.ma_basement_sonos
ma_favorite_button_entity_id: button.ma_basement_favorite_current_song
mode: card
size: large
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
  player_is_active_when: playing_or_paused
  player_view_icon: mdi:play
  media_browser_view_icon: mdi:folder-star
  search_view_title: Global Search
  ma_search_thumbs_columns: 4
  ma_search_compact_thumbs_columns: 5
  ma_library_root_columns: 4
  ma_library_thumbs_columns: 4
  ma_library_compact_thumbs_columns: 5
  volume_trailing_button: group_volume
  always_show_footer_more_actions: true
  secondary_view_mini_player_mode: compact

ma_favorite_control:
  show_on_artwork: true
  artwork_button_size: medium
  artwork_inset_top: "5%"
  artwork_inset_right: "6%"
  active_icon: mdi:star
  inactive_icon: mdi:star-outline
  active_color: "#f2c94c"

media_players:
  - entity_id: media_player.ma_basement_sonos
    ma_entity_id: media_player.ma_basement_sonos
    ma_favorite_button_entity_id: button.ma_basement_favorite_current_song
    can_be_grouped: true
    search:
      - entity_id: media_player.ma_basement_sonos
        name: MA Basement Sonos
        media_types:
          - media_type: playlists
            name: Playlists
            icon: mdi:playlist-music
          - media_type: artists
            name: Artists
            icon: mdi:account-music
          - media_type: albums
            name: Albums
            icon: mdi:album
          - media_type: tracks
            name: Tracks
            icon: mdi:music-note
    volume_panel:
      show_when: always
      entities:
        - entity_id: media_player.ma_basement_sonos
          name: Sonos
        - entity_id: media_player.sc_lx704
          name: Receiver
          show_power: true

  - entity_id: media_player.ma_dining_sl
    can_be_grouped: true
    media_browser: []
    search: []
    volume_panel:
      show_when: always
      entities:
        - entity_id: media_player.ma_dining_sl
          name: Dining
```

## 12. Current Limitations

- Home Assistant media browser root filtering only affects the first/root Browse Media screen
- the native grouped-volume panel currently opens in the large-card view
- Music Assistant unfavorite currently depends on `mass_queue.unfavorite_current_item`, which is limited for some provider-backed items
- the MA library view currently provides root category tiles and category pages, but not a deeper nested browser such as `Artist -> Albums -> Tracks`
- blank Global Search currently shows grouped default results rather than true recent/popular/recommended feeds
- the overflow menus do not yet implement full MA-style provider filtering and sort controls
- the HA browser/search paths only reflect what the selected HA media player exposes through `browse_media` / `search_media`
- the forced `All` MA chip is broader than the configured subset and is still prepended automatically
- some MA media types may not be available on every backend or HA integration version; unsupported categories now fail soft instead of breaking the whole `All` view
