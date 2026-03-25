## Summary

This PR reshapes the Music Assistant experience in the large multi-player card so `Search` and `Browse Media` stop feeling like the same page with slightly different labels.

It does two related things:

- it gives Music Assistant a real search-first surface
- it gives Music Assistant a real browse-first/library surface

It also tightens the routing model so `ma_entity_id` now implies both MA Search and MA Browse in a way that is much easier to explain.

This is intentionally a meaty PR. I originally had a smaller MA search "foundation" slice, but it was too thin to be useful on its own, so I folded that groundwork into this larger user-facing PR.

## Why

Before this change, the MA experience had two separate problems.

### 1. Search and Browse overlapped too much

In practice:

- Search could browse
- Browse could search
- both often showed similar results
- the difference felt more accidental than intentional

That made the UX hard to explain:

- which surface should a user actually use?
- what is supposed to be the "source of truth" for MA content?
- why do the two tabs sometimes feel like variants of the same page?

### 2. The MA inference model was not consistent

Before this PR:

- `ma_entity_id` already implied MA Search
- but `ma_entity_id` did **not** imply MA Browse
- Browse Media still needed separate `media_browser` config just to appear
- and once it appeared, the route into HA vs MA was not obvious to reason about

That was especially confusing in mixed-player setups.

The goal of this PR is to make the MA path more coherent from a UX point of view:

- `Search` should feel query-first
- `Browse Media` should feel library-first
- `ma_entity_id` should imply a consistent MA experience unless the user explicitly configures otherwise

## UX Model After This PR

The simplest mental model after this PR is:

- `ma_entity_id` means this player has a Music Assistant-backed experience
- `Search` is the MA global-search surface for that player
- `Browse Media` is the MA library/browse surface for that player
- explicit `search` and `media_browser` config refine that behavior
- explicit disable still wins where supported

That is much easier to explain than the previous split where Search inferred MA but Browse did not.

## User-Facing Behavior

### Search

For the selected player:

- if `ma_entity_id` exists, the Search tab appears
- if `search` is also configured, those HA-style search providers are added alongside the inferred MA provider
- when the selected search provider matches `ma_entity_id`, the card renders the MA search surface
- otherwise it renders HA Search

From a UX perspective, Search is now clearly the "find something quickly" surface.

### Browse Media

For the selected player:

- if `ma_entity_id` exists and `media_browser` is omitted, Browse Media now appears and infers an MA provider
- if `media_browser` is configured without an explicit `entity_id`, it now prefers `ma_entity_id` over the generic player `entity_id`
- if the resolved media-browser entry matches `ma_entity_id`, Browse Media renders the MA library surface
- otherwise it renders the HA Media Browser
- `media_browser: []` still explicitly disables Browse Media for that player
- legacy `media_browser.enabled: false` also still explicitly disables Browse Media

From a UX perspective, Browse Media is now clearly the "explore the library" surface.

### Mixed-player cards

This PR keeps the behavior player-centric.

That means the **selected player** still determines what Search and Browse mean.

Examples:

- if the selected player has `ma_entity_id`, Search and Browse can both resolve to MA
- if the selected player does not have `ma_entity_id`, the card falls back to HA/Lyrion behavior for that player
- if one player explicitly disables `media_browser`, Browse can disappear for that selected player even if another player in the same card supports it

This is intentional. The selected player is the active playback context, so the Search/Browse surfaces should follow that player.

## What changed

### 1. MA Search becomes a real Global Search surface

The MA Search view now behaves like a proper global-search surface rather than a favorites/browser hybrid.

Key changes:

- blank query shows default grouped library results by category
- typed query searches across MA sources/providers
- `Only show favorites` is now a menu toggle instead of a top-level mode row
- category chips filter the current result scope
- view mode can be switched between:
  - `List`
  - `Thumbs`
  - `Compact Thumbs`
- view mode is persisted by surface and category

Why this matters for UX:
Search now feels search-first rather than trying to carry the full burden of browsing, favorites, and discovery in one overloaded screen.

### 2. Browse Media becomes an MA library surface when routed to MA

When the selected media-browser entry resolves to the MA entity, Browse Media now routes into a dedicated MA library browser instead of the generic HA browser.

That MA library browser now has:

- root category tiles filtered by `media_browser.media_types`
- click-through category pages
- category-local filtering/search
- favorites-only toggle
- list/thumbs/compact-thumbs view mode
- persisted view mode by category

Why this matters for UX:
Browse Media now has a clear purpose again: start from the library, then drill into a category.

### 3. `ma_entity_id` now implies MA Browse as well as MA Search

This is the most important routing clarification in the PR.

Before:

- `ma_entity_id` implied Search
- Browse still needed separate `media_browser` config just to exist

After:

- `ma_entity_id` implies Search
- `ma_entity_id` also implies Browse, unless Browse is explicitly disabled

This makes the MA story much more consistent.

### 4. MA media-type config is now honored more consistently

The MA path now uses configured media types instead of ignoring them.

In practice:

- `search[].media_types` controls which MA categories appear in MA Search
- `media_browser.media_types` controls which MA root categories appear in the MA library browser

Why this matters for UX:
users who configure categories should see those categories reflected in the MA surfaces, not just in HA-shaped paths.

### 5. Search and MA Library now share a common results renderer

The two MA surfaces now share the same result rendering logic and density controls.

New options:

```yaml
options:
  ma_search_thumbs_columns: 4
  ma_search_compact_thumbs_columns: 5
  ma_library_root_columns: 4
  ma_library_thumbs_columns: 4
  ma_library_compact_thumbs_columns: 5
```

Why this matters for UX:
it keeps the MA surfaces visually aligned instead of feeling like two unrelated implementations.

### 6. Shared input now supports a clear `x`

The shared `Input` component now supports `clearable`, and both HA Search and MA Search use it.

Why this matters:
small change, but it matters much more once Search becomes a primary MA surface.

### 7. Missing-artwork placeholders now support initials

Shared media images can now render initials placeholders when there is no artwork URL and no fallback icon.

Why this matters:
MA items without artwork look much more intentional instead of appearing broken or empty.

## Configuration Examples

### Minimal MA player

```yaml
media_players:
  - entity_id: media_player.ma_basement_sonos
    ma_entity_id: media_player.ma_basement_sonos
```

Behavior:

- Search appears and uses MA
- Browse Media appears and uses MA

### MA Search with explicit category filtering

```yaml
media_players:
  - entity_id: media_player.ma_basement_sonos
    ma_entity_id: media_player.ma_basement_sonos
    search:
      - entity_id: media_player.ma_basement_sonos
        name: Music Assistant
        media_types:
          - media_type: playlists
          - media_type: artists
          - media_type: albums
          - media_type: tracks
          - media_type: radios
```

Behavior:

- Search is still MA
- the visible MA search categories are filtered by `media_types`

### MA Browse with explicit category filtering

```yaml
media_browser:
  enabled: true
  media_types:
    - media_type: playlists
    - media_type: artists
    - media_type: albums
    - media_type: tracks
```

Behavior:

- Browse Media appears
- when routed to MA, the MA library root tiles are filtered by `media_types`

### Explicitly disabling Browse for an MA player

```yaml
media_players:
  - entity_id: media_player.ma_dining_sl
    ma_entity_id: media_player.ma_dining_sl
    media_browser: []
```

Behavior:

- Search can still infer MA from `ma_entity_id`
- Browse Media is explicitly disabled for that player

### Density tuning

```yaml
options:
  ma_search_thumbs_columns: 4
  ma_search_compact_thumbs_columns: 5
  ma_library_root_columns: 4
  ma_library_thumbs_columns: 4
  ma_library_compact_thumbs_columns: 5
```

## Compatibility

This PR is additive, but it is behaviorally visible.

What stays compatible:

- existing HA Search behavior is still available for non-MA providers
- existing Browse Media behavior is still used for non-MA media-browser entries
- existing YAML remains valid
- omitted MA density options fall back to defaults

What changes visibly:

- MA Search is no longer a favorites-first mode-row experience
- MA Browse Media is no longer just the generic HA browser when routed to the MA entity
- MA Browse Media can now appear from `ma_entity_id` alone, unless explicitly disabled

## Scope

Included here:

- MA Global Search behavior
- MA Library/Browse behavior
- MA Browse inference from `ma_entity_id`
- clearable input
- shared initials placeholder support
- MA view mode persistence
- MA density options

Still intentionally out of scope:

- later padding/gap polish
- compact mini-player visual tuning
- final search/browser spacing refinements

Those should remain in a final visual-polish PR so this one stays focused on behavior and interaction model.

## Files changed

MA Search / MA Library:

- `src/components/MaSearch/MaSearch.tsx`
- `src/components/MaSearch/MaLibraryBrowser.tsx`
- `src/components/MaSearch/MaResultsView.tsx`
- `src/components/MaSearch/constants.ts`
- `src/components/MaSearch/types.ts`
- `src/components/MaSearch/useFavorites.ts`
- `src/components/MaSearch/useLibrary.ts`
- `src/components/MaSearch/useMaPlayItem.ts`
- `src/components/MaSearch/usePersistedMaViewMode.ts`
- `src/components/MaSearch/useSearchQuery.ts`

Routing / large views:

- `src/components/MediaBrowser/MediaBrowser.tsx`
- `src/components/MediocreLargeMultiMediaPlayerCard/components/SearchView.tsx`
- `src/components/MediocreLargeMultiMediaPlayerCard/components/MediaBrowserView.tsx`
- `src/components/MediocreLargeMultiMediaPlayerCard/components/FooterActions.tsx`

Compact routing:

- `src/components/MediocreCompactMultiMediaPlayerCard/MediocreCompactMultiMediaPlayerCard.tsx`
- `src/components/MediocreCompactMultiMediaPlayerCard/components/MediaBrowserBar.tsx`

Shared UI:

- `src/components/Input/Input.tsx`
- `src/components/HaSearch/HaSearch.tsx`
- `src/components/MediaSearch/components/MediaImage.tsx`
- `src/components/MediaSearch/components/MediaItem.tsx`
- `src/components/MediaSearch/components/MediaTrack.tsx`
- `src/components/MediaSearch/components/StyledComponents.ts`
- `src/components/MediocreLargeMultiMediaPlayerCard/components/MiniPlayer.tsx`

Config/helpers:

- `src/types/config.ts`
- `src/utils/getHasMediaBrowser.ts`
- `src/utils/getMediaBrowserEntryArray.ts`
- `src/utils/getMediocreLegacyConfigToMultiConfig.ts`
- `src/utils/getMediocreMassiveLegacyConfigToMultiConfig.ts`
- `src/utils/getMultiConfigToMediocreMassiveConfig.ts`

Tests:

- `src/components/MaSearch/constants.test.ts`
- `src/components/MediaSearch/components/getMediaPlaceholderText.test.ts`
- `src/utils/getHasMediaBrowser.test.ts`
- `src/utils/getMediaBrowserEntryArray.test.ts`

## Validation

Validated locally with:

- `yarn tsc --noEmit`
- `yarn test`
- `yarn build`

I also generated:

- `dist/mediocre-hass-media-player-cards.js`
- `dist/mediocre-hass-media-player-cards.js.gz`

## Note on stacking

This PR is stacked on top of PRs 1 through 6.

That means the branch includes those earlier changes, but the PR diff should only show the new Search/Library work when the base is set to `pr/06-secondary-mini-player`.
