import { Chip, Icon, IconButton, Input } from "@components";
import { useEffect, useMemo, useState } from "preact/hooks";
import { useDebounce } from "@uidotdev/usehooks";
import { searchStyles } from "@components/MediaSearch";
import { MaFilterType, MaEnqueueMode } from "./types";
import { useSearchQuery } from "./useSearchQuery";
import { useLibrary } from "./useLibrary";
import { getMaFilterConfig } from "./constants";
import { MaMediaItemsList } from "./MaMediaItemsList";
import { JSX } from "preact/jsx-runtime";
import { useIntl } from "@components/i18n";
import {
  OverlayMenu,
  OverlayMenuItem,
} from "@components/OverlayMenu/OverlayMenu";
import type { SearchMediaType } from "@types";

export type MaSearchProps = {
  maEntityId: string;
  horizontalPadding?: number;
  additionalOptions?: OverlayMenuItem[];
  filterConfig?: SearchMediaType[];
  defaultScope?: MaSearchScope;
  showModeText?: boolean;
  providerLabel?: string;
  providerMenuItems?: OverlayMenuItem[];
  searchBarPosition?: "top" | "bottom";
  maxHeight?: number;
  renderHeader?: () => JSX.Element;
};

export type MaSearchScope = "favorites" | "library" | "discover";

export const MaSearch = ({
  maEntityId,
  horizontalPadding,
  searchBarPosition = "top",
  additionalOptions = [],
  filterConfig,
  defaultScope = "favorites",
  showModeText = false,
  providerLabel,
  providerMenuItems,
  maxHeight = 300,
  renderHeader,
}: MaSearchProps) => {
  const { t } = useIntl();
  const [query, setQuery] = useState("");
  const [enqueueMode, setEnqueueMode] = useState<MaEnqueueMode>("play");
  const normalizedQuery = query.trim();
  const debouncedQuery = useDebounce(normalizedQuery, 600);
  const [activeFilter, setActiveFilter] = useState<MaFilterType>("all");
  const [scope, setScope] = useState<MaSearchScope>(defaultScope);
  const [resultLimit, setResultLimit] = useState(getDefaultLimit("favorites", "all"));
  const resolvedFilters = useMemo(() => getMaFilterConfig(filterConfig), [filterConfig]);
  const isFavoritesScope = scope === "favorites";
  const isLibraryScope = scope === "library";
  const isDiscoverScope = scope === "discover";

  useEffect(() => {
    setScope(defaultScope);
  }, [defaultScope, maEntityId]);

  useEffect(() => {
    if (resolvedFilters.some(filter => filter.type === activeFilter)) return;
    setActiveFilter(resolvedFilters[0]?.type ?? "all");
  }, [activeFilter, resolvedFilters]);

  useEffect(() => {
    setResultLimit(getDefaultLimit(scope, activeFilter));
  }, [scope, activeFilter, normalizedQuery]);

  const { results, loading, playItem, canLoadMore: canLoadMoreSources } = useSearchQuery(
    debouncedQuery,
    activeFilter,
    {
      enabled: isDiscoverScope,
      limit: resultLimit,
    }
  );

  const { library: favorites, loading: favoritesLoading, canLoadMore: canLoadMoreFavorites } =
    useLibrary(activeFilter, {
      enabled: isFavoritesScope,
      favorite: true,
      search: isFavoritesScope ? debouncedQuery : "",
      limit: resultLimit,
    });
  const { library, loading: libraryLoading, canLoadMore: canLoadMoreLibrary } =
    useLibrary(activeFilter, {
      enabled: isLibraryScope,
      search: isLibraryScope ? debouncedQuery : "",
      limit: resultLimit,
    });
  const isLoading =
    (isDiscoverScope && normalizedQuery !== "" && loading) ||
    (isFavoritesScope && favoritesLoading) ||
    (isLibraryScope && libraryLoading);

  const modeText = getModeText({
    normalizedQuery,
    scope,
    t,
  });
  const displayedResults =
    isDiscoverScope
      ? normalizedQuery === ""
        ? undefined
        : results
      : isLibraryScope
        ? library ?? undefined
        : favorites ?? undefined;
  const canLoadMore = isDiscoverScope
    ? normalizedQuery !== "" && canLoadMoreSources
    : isLibraryScope
      ? canLoadMoreLibrary
      : canLoadMoreFavorites;
  const emptyText =
    isDiscoverScope && normalizedQuery === ""
      ? t({
          id: "Search.mode.type_to_discover_sources",
          defaultMessage: "Type to discover across all sources.",
        })
      : undefined;
  const handleLoadMore = () => {
    if (!canLoadMore || isLoading) return;
    setResultLimit(prev => prev + getLoadMoreStep(scope, activeFilter));
  };

  const renderSearchBar = () => {
    return (
      <div css={searchStyles.searchBarContainer}>
        {!!renderHeader && renderHeader()}
        <div css={searchStyles.inputRow}>
          <Input
            placeholder={t({ id: "Search.input_placeholder" })}
            onChange={setQuery}
            value={query}
            clearable
            loading={isLoading}
            css={searchStyles.input}
          />
          <OverlayMenu
            align="end"
            side="bottom"
            menuItems={[
              ...additionalOptions,
              {
                type: "title",
                label: t({
                  id: "Search.enqueue_mode.title",
                  defaultMessage: "Enqueue Mode",
                }),
              },
              {
                label: t({
                  id: "Search.enqueue_mode.play",
                  defaultMessage: "Play",
                }),
                selected: enqueueMode === "play",
                icon: getEnqueModeIcon("play"),
                onClick: () => setEnqueueMode("play"),
              },
              {
                label: t({
                  id: "Search.enqueue_mode.replace",
                  defaultMessage: "Replace Queue",
                }),
                selected: enqueueMode === "replace",
                icon: getEnqueModeIcon("replace"),
                onClick: () => setEnqueueMode("replace"),
              },
              {
                label: t({
                  id: "Search.enqueue_mode.next",
                  defaultMessage: "Add Next",
                }),
                selected: enqueueMode === "next",
                icon: getEnqueModeIcon("next"),
                onClick: () => setEnqueueMode("next"),
              },
              {
                label: t({
                  id: "Search.enqueue_mode.replace_next",
                  defaultMessage: "Replace Next",
                }),
                selected: enqueueMode === "replace_next",
                icon: getEnqueModeIcon("replace_next"),
                onClick: () => setEnqueueMode("replace_next"),
              },
              {
                label: t({
                  id: "Search.enqueue_mode.add",
                  defaultMessage: "Add to Queue",
                }),
                selected: enqueueMode === "add",
                icon: getEnqueModeIcon("add"),
                onClick: () => setEnqueueMode("add"),
              },
            ]}
            renderTrigger={triggerProps => (
              <IconButton
                size="x-small"
                icon={
                  !additionalOptions || additionalOptions.length === 0
                    ? getEnqueModeIcon(enqueueMode)
                    : "mdi:cog"
                }
                {...triggerProps}
              />
            )} 
          />
        </div>
        {providerMenuItems && providerMenuItems.length > 1 && (
          <div css={searchStyles.chipRow}>
            <OverlayMenu
              menuItems={providerMenuItems}
              align="end"
              side="bottom"
              renderTrigger={triggerProps => (
                <Chip
                  icon="mdi:import"
                  size="small"
                  invertedColors
                  border
                  {...triggerProps}
                >
                  {providerLabel ?? maEntityId}
                  <Icon icon="mdi:chevron-down" size="x-small" />
                </Chip>
              )}
            />
          </div>
        )}
        <div css={searchStyles.chipRow}>
          <Chip
            css={searchStyles.chip}
            style={{
              opacity: isFavoritesScope ? 1 : 0.6,
              fontWeight: isFavoritesScope ? "bold" : "normal",
            }}
            icon="mdi:star"
            onClick={() => setScope("favorites")}
          >
            {t({
              id: "Search.scope.favorites",
              defaultMessage: "Favorites",
            })}
          </Chip>
          <Chip
            css={searchStyles.chip}
            style={{
              opacity: isLibraryScope ? 1 : 0.6,
              fontWeight: isLibraryScope ? "bold" : "normal",
            }}
            icon="mdi:folder-music"
            onClick={() => setScope("library")}
          >
            {t({
              id: "Search.scope.library",
              defaultMessage: "Library",
            })}
          </Chip>
          <Chip
            css={searchStyles.chip}
            style={{
              opacity: isDiscoverScope ? 1 : 0.6,
              fontWeight: isDiscoverScope ? "bold" : "normal",
            }}
            icon="mdi:database-search"
            onClick={() => setScope("discover")}
          >
            {t({
              id: "Search.scope.discover",
              defaultMessage: "Discover",
            })}
          </Chip>
        </div>
        {showModeText && <div css={searchStyles.modeText}>{modeText}</div>}
        <div css={searchStyles.scrollingChipRow}>{renderFilterChips()}</div>
      </div>
    );
  };

  const renderFilterChips = () => {
    return resolvedFilters.map(filter => (
      <Chip
        css={searchStyles.chip}
        style={{
          opacity: activeFilter === filter.type ? 1 : 0.6,
          fontWeight: activeFilter === filter.type ? "bold" : "normal",
        }}
        key={filter.type}
        onClick={() => setActiveFilter(filter.type)}
        icon={filter.icon}
      >
        {t({
          id: `Search.categories.${filter.label}`,
          defaultMessage: filter.label,
        })}
      </Chip>
    ));
  };

  return (
    <div
      css={searchStyles.root}
      style={{
        "--mmpc-search-padding": `${horizontalPadding}px`,
      }}
    >
      <MaMediaItemsList
        renderHeader={searchBarPosition === "top" ? renderSearchBar : undefined}
        results={displayedResults}
        emptyText={emptyText}
        onItemClick={item => playItem(item, maEntityId, enqueueMode)}
        style={{
          "--mmpc-search-padding": `${horizontalPadding}px`,
        }}
        maxHeight={maxHeight}
        onHeaderClick={setActiveFilter}
        onEndReached={canLoadMore ? handleLoadMore : undefined}
      />
      {searchBarPosition === "bottom" && renderSearchBar()}
    </div>
  );
};

const getDefaultLimit = (scope: MaSearchScope, filter: MaFilterType) => {
  if (scope === "discover") {
    return filter === "all" ? 12 : filter === "music" ? 36 : 100;
  }
  return filter === "all" ? 12 : filter === "music" ? 24 : 100;
};

const getLoadMoreStep = (scope: MaSearchScope, filter: MaFilterType) => {
  if (scope === "discover") {
    return filter === "all" ? 12 : filter === "music" ? 24 : 50;
  }
  return filter === "all" ? 8 : filter === "music" ? 16 : 50;
};

const getModeText = ({
  normalizedQuery,
  scope,
  t,
}: {
  normalizedQuery: string;
  scope: MaSearchScope;
  t: ReturnType<typeof useIntl>["t"];
}) => {
  if (normalizedQuery === "") {
    if (scope === "favorites") {
      return t({
        id: "Search.mode.showing_favorites",
        defaultMessage: "Showing favorites",
      });
    }
    if (scope === "library") {
      return t({
        id: "Search.mode.showing_library",
        defaultMessage: "Showing library",
      });
    }
    return t({
      id: "Search.mode.type_to_discover_sources",
      defaultMessage: "Type to discover across all sources.",
    });
  }

  if (scope === "favorites") {
    return t({
      id: "Search.mode.showing_favorite_results",
      defaultMessage: "Showing favorite results",
    });
  }
  if (scope === "library") {
    return t({
      id: "Search.mode.showing_library_results",
      defaultMessage: "Showing library results",
    });
  }
  return t({
    id: "Search.mode.showing_discovery_results",
    defaultMessage: "Showing discovery results",
  });
};

const getEnqueModeIcon = (enqueueMode: MaEnqueueMode) => {
  switch (enqueueMode) {
    case "play": // Play now
      return "mdi:play-circle";
    case "replace": // Replace the existing queue and play now
      return "mdi:playlist-remove";
    case "next": // Add to the current queue after the currently playing item
      return "mdi:playlist-play";
    case "replace_next": // Replace the current queue after the currently playing item
      return "mdi:playlist-edit";
    case "add": // Add to the end of the queue
      return "mdi:playlist-plus";
    default:
      return "mdi:play-circle";
  }
};
