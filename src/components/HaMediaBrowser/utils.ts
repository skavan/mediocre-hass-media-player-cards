import { HaEnqueueMode } from "@components/HaSearch/types";
import { MediaBrowserMediaType } from "@types";
import { HaMediaBrowserItem } from "./HaMediaBrowser";
import { MediaClass, MediaContentType } from "./types";

const ROOT_MEDIA_BROWSER_TYPE_ALIASES: Record<string, string> = {
  album: MediaContentType.Albums,
  albums: MediaContentType.Albums,
  artist: MediaContentType.Artists,
  artists: MediaContentType.Artists,
  playlist: MediaContentType.Playlists,
  playlists: MediaContentType.Playlists,
  radio: MediaContentType.Radios,
  "radio station": MediaContentType.Radios,
  "radio stations": MediaContentType.Radios,
  radios: MediaContentType.Radios,
  track: MediaContentType.Tracks,
  tracks: MediaContentType.Tracks,
};

const ROOT_MEDIA_BROWSER_CLASS_ALIASES: Partial<Record<MediaClass, string>> = {
  [MediaClass.Album]: MediaContentType.Albums,
  [MediaClass.Artist]: MediaContentType.Artists,
  [MediaClass.Playlist]: MediaContentType.Playlists,
  [MediaClass.Track]: MediaContentType.Tracks,
};

export const getEnqueueModeIcon = (enqueueMode: HaEnqueueMode) => {
  switch (enqueueMode) {
    case "play": // Play now
      return "mdi:play-circle";
    case "replace": // Replace the existing queue and play now
      return "mdi:playlist-remove";
    case "next": // Add to the current queue after the currently playing item
      return "mdi:playlist-play";
    case "add": // Add to the end of the queue
      return "mdi:playlist-plus";
    default:
      return "mdi:play-circle";
  }
};

export const getItemMdiIcon = (item: Partial<HaMediaBrowserItem>) => {
  if (item.icon) return item.icon;
  if (item.thumbnail) return null;
  // this function is a little silly because it seems like there's no real standard way to declare these
  switch (item.media_content_type) {
    case MediaContentType.Albums:
      return "mdi:album";
    case MediaContentType.Artists:
      return "mdi:account-music";
    case MediaContentType.Tracks:
      return "mdi:music-note";
    case MediaContentType.Playlists:
      return "mdi:playlist-music";
    case MediaContentType.Genres:
      return "mdi:music-box-multiple";
    case MediaContentType.App:
      return "mdi:application";
    case MediaContentType.Favorites:
      return "mdi:star";
    case MediaContentType.NewMusic:
    case MediaContentType.AlbumArtists:
    case MediaContentType.Radios:
    default:
      break;
  }

  switch (item.children_media_class ?? item.media_class) {
    case MediaClass.Album:
      return "mdi:album";
    case MediaClass.Artist:
      return "mdi:account-music";
    case MediaClass.Track:
      return "mdi:music-note";
    case MediaClass.Playlist:
      return "mdi:playlist-music";
    case MediaClass.Genre:
      return "mdi:music-box-multiple";
    case MediaClass.App:
      return "mdi:application";
    case MediaClass.Music:
      return "mdi:music";
    case MediaClass.Podcast:
      return "mdi:podcast";
    case MediaClass.Directory:
      return "mdi:folder";
    default:
      return "mdi:folder";
  }
};

const getCanonicalRootMediaBrowserType = (mediaType?: string | null) => {
  if (!mediaType) {
    return null;
  }

  return ROOT_MEDIA_BROWSER_TYPE_ALIASES[mediaType.trim().toLowerCase()] ?? null;
};

const getCanonicalRootMediaBrowserTypeFromItem = (
  item: Partial<HaMediaBrowserItem>
) => {
  const contentTypeMatch = getCanonicalRootMediaBrowserType(item.media_content_type);
  if (contentTypeMatch) {
    return contentTypeMatch;
  }

  const contentIdMatch = getCanonicalRootMediaBrowserType(item.media_content_id);
  if (contentIdMatch) {
    return contentIdMatch;
  }

  const titleMatch = getCanonicalRootMediaBrowserType(item.title);
  if (titleMatch) {
    return titleMatch;
  }

  const classMatch =
    ROOT_MEDIA_BROWSER_CLASS_ALIASES[
      (item.children_media_class ?? item.media_class) as MediaClass
    ];
  if (classMatch) {
    return classMatch;
  }

  return null;
};

export const filterMediaBrowserRootItems = (
  items: HaMediaBrowserItem[],
  mediaTypes?: MediaBrowserMediaType[]
) => {
  if (!mediaTypes?.length) {
    return items;
  }

  const itemsByType = new Map<string, HaMediaBrowserItem>();
  items.forEach(item => {
    const canonicalType = getCanonicalRootMediaBrowserTypeFromItem(item);
    if (canonicalType && !itemsByType.has(canonicalType)) {
      itemsByType.set(canonicalType, item);
    }
  });

  const seenTypes = new Set<string>();

  return mediaTypes.reduce<HaMediaBrowserItem[]>((result, mediaTypeConfig) => {
    const canonicalType = getCanonicalRootMediaBrowserType(
      mediaTypeConfig.media_type
    );
    if (!canonicalType || seenTypes.has(canonicalType)) {
      return result;
    }

    const item = itemsByType.get(canonicalType);
    seenTypes.add(canonicalType);

    if (!item) {
      return result;
    }

    result.push({
      ...item,
      title: mediaTypeConfig.name ?? item.title,
      icon: mediaTypeConfig.icon ?? item.icon,
    });
    return result;
  }, []);
};
