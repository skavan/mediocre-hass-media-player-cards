import {
  getDefaultValuesFromMassiveConfig,
  getSimpleConfigFromFormValues,
  getSimpleConfigFromMassiveFormValues,
} from "@utils/cardConfigUtils";
import {
  MediocreMassiveMediaPlayerCardConfig,
  MediocreMediaPlayerCardConfig,
} from "@types";

describe("cardConfigUtils trailing button fields", () => {
  it("preserves new large-card fields in massive default values", () => {
    const config: MediocreMassiveMediaPlayerCardConfig = {
      type: "custom:mediocre-massive-media-player-card",
      entity_id: "media_player.test",
      mode: "card",
      ma_favorite_control: {
        active_icon: "mdi:star",
      },
      volume_trailing_button_custom_button: {
        icon: "mdi:heart",
        name: "Favorite",
        tap_action: { action: "toggle" },
      },
      options: {
        player_view_icon: "mdi:speaker",
        volume_trailing_button: "custom",
      },
    };

    expect(getDefaultValuesFromMassiveConfig(config)).toEqual(
      expect.objectContaining({
        ma_favorite_control: {
          active_icon: "mdi:star",
        },
        volume_trailing_button_custom_button: {
          icon: "mdi:heart",
          name: "Favorite",
          tap_action: { action: "toggle" },
        },
        options: expect.objectContaining({
          player_view_icon: "mdi:speaker",
          volume_trailing_button: "custom",
        }),
      })
    );
  });

  it("keeps explicitly configured regular-card trailing button fields", () => {
    const config: MediocreMediaPlayerCardConfig = {
      type: "custom:mediocre-media-player-card",
      entity_id: "media_player.test",
      ma_favorite_control: {
        active_icon: "mdi:star",
      },
      volume_trailing_button_custom_button: {
        icon: "mdi:heart",
        name: "Favorite",
        tap_action: { action: "toggle" },
      },
      options: {
        player_view_icon: "mdi:speaker",
        volume_trailing_button: "custom",
      },
    };

    expect(getSimpleConfigFromFormValues(config)).toEqual(
      expect.objectContaining({
        ma_favorite_control: {
          active_icon: "mdi:star",
        },
        volume_trailing_button_custom_button: {
          icon: "mdi:heart",
          name: "Favorite",
          tap_action: { action: "toggle" },
        },
        options: {
          player_view_icon: "mdi:speaker",
          volume_trailing_button: "custom",
        },
      })
    );
  });

  it("keeps explicitly configured massive-card trailing button fields", () => {
    const config: MediocreMassiveMediaPlayerCardConfig = {
      type: "custom:mediocre-massive-media-player-card",
      entity_id: "media_player.test",
      mode: "card",
      ma_favorite_control: {
        active_icon: "mdi:star",
      },
      volume_trailing_button_custom_button: {
        icon: "mdi:heart",
        name: "Favorite",
        tap_action: { action: "toggle" },
      },
      options: {
        player_view_icon: "mdi:speaker",
        volume_trailing_button: "favorite",
      },
    };

    expect(getSimpleConfigFromMassiveFormValues(config)).toEqual(
      expect.objectContaining({
        mode: "card",
        ma_favorite_control: {
          active_icon: "mdi:star",
        },
        volume_trailing_button_custom_button: {
          icon: "mdi:heart",
          name: "Favorite",
          tap_action: { action: "toggle" },
        },
        options: {
          player_view_icon: "mdi:speaker",
          volume_trailing_button: "favorite",
        },
      })
    );
  });
});
