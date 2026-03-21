import { filterMediaBrowserRootItems, getItemMdiIcon } from "./utils";
import { MediaContentType, MediaClass } from "./types";

describe("HaMediaBrowser utils", () => {
  const rootItems = [
    {
      title: "Artists",
      media_class: MediaClass.Directory,
      media_content_type: MediaContentType.Artists,
      media_content_id: "artists",
      children_media_class: MediaClass.Artist,
      can_play: false,
      can_expand: true,
      thumbnail: null,
    },
    {
      title: "Albums",
      media_class: MediaClass.Directory,
      media_content_type: MediaContentType.Albums,
      media_content_id: "albums",
      children_media_class: MediaClass.Album,
      can_play: false,
      can_expand: true,
      thumbnail: null,
    },
    {
      title: "Tracks",
      media_class: MediaClass.Directory,
      media_content_type: MediaContentType.Tracks,
      media_content_id: "tracks",
      children_media_class: MediaClass.Track,
      can_play: false,
      can_expand: true,
      thumbnail: null,
    },
    {
      title: "Playlists",
      media_class: MediaClass.Directory,
      media_content_type: MediaContentType.Playlists,
      media_content_id: "playlists",
      children_media_class: MediaClass.Playlist,
      can_play: false,
      can_expand: true,
      thumbnail: null,
    },
    {
      title: "Radio",
      media_class: MediaClass.Directory,
      media_content_type: MediaContentType.Radios,
      media_content_id: "radios",
      children_media_class: MediaClass.App,
      can_play: false,
      can_expand: true,
      thumbnail: null,
    },
    {
      title: "Podcasts",
      media_class: MediaClass.Directory,
      media_content_type: "podcasts",
      media_content_id: "podcasts",
      children_media_class: MediaClass.Podcast,
      can_play: false,
      can_expand: true,
      thumbnail: null,
    },
  ];

  it("returns all items unchanged when media_types is omitted", () => {
    expect(filterMediaBrowserRootItems(rootItems)).toEqual(rootItems);
  });

  it("filters and orders configured root media types with label and icon overrides", () => {
    const result = filterMediaBrowserRootItems(rootItems, [
      {
        media_type: "playlists",
        name: "Queues",
        icon: "mdi:playlist-star",
      },
      {
        media_type: "artist",
        name: "Performers",
      },
      {
        media_type: "radio",
      },
    ]);

    expect(result.map(item => item.media_content_type)).toEqual([
      MediaContentType.Playlists,
      MediaContentType.Artists,
      MediaContentType.Radios,
    ]);
    expect(result.map(item => item.title)).toEqual([
      "Queues",
      "Performers",
      "Radio",
    ]);
    expect(getItemMdiIcon(result[0])).toBe("mdi:playlist-star");
  });

  it("ignores unsupported and duplicate configured media types", () => {
    const result = filterMediaBrowserRootItems(rootItems, [
      { media_type: "albums" },
      { media_type: "albums", name: "Duplicate Albums" },
      { media_type: "camera" },
      { media_type: "tracks" },
    ]);

    expect(result.map(item => item.media_content_type)).toEqual([
      MediaContentType.Albums,
      MediaContentType.Tracks,
    ]);
    expect(result.map(item => item.title)).toEqual(["Albums", "Tracks"]);
  });

  it("matches Music Assistant style root items by title and content id", () => {
    const maRootItems = [
      {
        title: "Artists",
        media_class: MediaClass.Directory,
        media_content_type: "directory",
        media_content_id: "library://artists",
        children_media_class: MediaClass.Directory,
        can_play: false,
        can_expand: true,
        thumbnail: null,
      },
      {
        title: "Albums",
        media_class: MediaClass.Directory,
        media_content_type: "directory",
        media_content_id: "library://albums",
        children_media_class: MediaClass.Directory,
        can_play: false,
        can_expand: true,
        thumbnail: null,
      },
      {
        title: "Radio Stations",
        media_class: MediaClass.Directory,
        media_content_type: "directory",
        media_content_id: "library://radios",
        children_media_class: MediaClass.Directory,
        can_play: false,
        can_expand: true,
        thumbnail: null,
      },
    ];

    const result = filterMediaBrowserRootItems(maRootItems, [
      { media_type: "artists" },
      { media_type: "radios" },
    ]);

    expect(result.map(item => item.title)).toEqual(["Artists", "Radio Stations"]);
  });
});
