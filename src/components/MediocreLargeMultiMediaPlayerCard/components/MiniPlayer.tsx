import {
  CardContext,
  CardContextProvider,
  CardContextType,
} from "@components/CardContext";
import { IconButton, usePlayer } from "@components";
import { MediaImage } from "@components/MediaSearch";
import { MediocreMediaPlayerCard } from "@components/MediocreMediaPlayerCard";
import { theme } from "@constants";
import { css } from "@emotion/react";
import { useSupportedFeatures } from "@hooks";
import { usePlayerActions } from "@hooks/usePlayerActions";
import {
  MediocreMultiMediaPlayerCardConfig,
  MediocreMediaPlayerCardConfig,
} from "@types";
import { getDeviceIcon, getHass, getVolumeIcon } from "@utils";
import { memo } from "preact/compat";
import { useCallback, useContext, useMemo } from "preact/hooks";
import { NavigationRoute } from "../MediocreLargeMultiMediaPlayerCard";
import { useSelectedPlayer } from "@components/SelectedPlayerContext";

export type MiniPlayerProps = {
  setNavigationRoute: (route: NavigationRoute) => void;
  navigationRoute: NavigationRoute;
};

const styles = {
  root: css({
    borderRadius: "12px",
    overflow: "hidden",
  }),
  compactRoot: css({
    borderRadius: theme.sizes.cardBorderRadius,
    overflow: "hidden",
  }),
  compactCard: css({
    borderRadius: theme.sizes.cardBorderRadius,
    overflow: "hidden",
  }),
  compactButton: css({
    width: "100%",
    display: "grid",
    gridTemplateColumns: "56px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 14,
    padding: 6,
    border: "none",
    background: "transparent",
    color: "inherit",
    font: "inherit",
    textAlign: "left",
    cursor: "pointer",
  }),
  artwork: css({
    width: 56,
    height: 56,
    borderRadius: 6,
    overflow: "hidden",
    flexShrink: 0,
  }),
  textColumn: css({
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 0,
  }),
  title: css({
    fontSize: 16,
    fontWeight: 700,
    color: theme.colors.onCard,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  subtitle: css({
    fontSize: 12,
    color: theme.colors.onCardMuted,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  actions: css({
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifySelf: "end",
  }),
  controlButton: css({
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 14,
    minWidth: 40,
    minHeight: 40,
    width: 40,
    height: 40,
    padding: 8,
    "@media (hover: hover)": {
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.08)",
      },
      "&:active": {
        backgroundColor: "rgba(0, 0, 0, 0.1)",
      },
    },
  }),
};

const PLAYER_STATE_TITLES = new Set([
  "Playing",
  "Paused",
  "Idle",
  "Off",
  "On",
  "Standby",
  "Buffering",
  "Unavailable",
]);

export const MiniPlayer = memo<MiniPlayerProps>(
  ({ setNavigationRoute, navigationRoute }) => {
    const { rootElement, config } =
      useContext<CardContextType<MediocreMultiMediaPlayerCardConfig>>(
        CardContext
      );

    const { selectedPlayer } = useSelectedPlayer();
    const mediaPlayer = selectedPlayer!;
    const miniPlayerMode =
      config.options?.secondary_view_mini_player_mode ?? "default";

    const cardConfig: MediocreMediaPlayerCardConfig = useMemo(() => {
      const { custom_buttons: _custom_buttons, ...rest } = mediaPlayer;
      const speakerGroupEntities = config.media_players
        .filter(player => player.can_be_grouped)
        .map(player => {
          if (player.name) {
            return {
              name: player.name,
              entity: player.speaker_group_entity_id ?? player.entity_id,
            };
          } else {
            return player.speaker_group_entity_id ?? player.entity_id;
          }
        });
      return {
        type: "custom:mediocre-media-player-card",
        speaker_group:
          speakerGroupEntities.length > 0
            ? {
                entity_id:
                  mediaPlayer.speaker_group_entity_id || mediaPlayer.entity_id,
                entities: speakerGroupEntities,
              }
            : undefined,
        options: {
          show_volume_step_buttons:
            config.options?.show_volume_step_buttons ?? false,
          use_volume_up_down_for_step_buttons:
            config.options?.use_volume_up_down_for_step_buttons ?? false,
        },
        ...rest,
        use_art_colors: config.use_art_colors,
      };
    }, [mediaPlayer, config]);

    const handleOnClick = useCallback(() => {
      if (navigationRoute === "speaker-grouping") {
        return setNavigationRoute("massive");
      }
      return setNavigationRoute("speaker-grouping");
    }, [setNavigationRoute, navigationRoute]);

    if (miniPlayerMode === "hidden") {
      return null;
    }

    if (miniPlayerMode === "compact") {
      return (
        <CompactMiniPlayer
          mediaPlayerName={mediaPlayer.name}
          onClick={handleOnClick}
        />
      );
    }

    return (
      <div css={styles.root}>
        <CardContextProvider rootElement={rootElement} config={cardConfig}>
          <MediocreMediaPlayerCard
            isEmbeddedInMultiCard
            onClick={handleOnClick}
          />
        </CardContextProvider>
      </div>
    );
  }
);

type CompactMiniPlayerProps = {
  mediaPlayerName?: string | null;
  onClick: () => void;
};

const CompactMiniPlayer = ({
  mediaPlayerName,
  onClick,
}: CompactMiniPlayerProps) => {
  const { setLastInteraction } = useSelectedPlayer();
  const player = usePlayer();
  const {
    previousTrack,
    togglePlayback,
    nextTrack,
    stop,
    togglePower,
  } = usePlayerActions();
  const {
    supportNextTrack,
    supportPreviousTrack,
    supportsStop,
    supportsTogglePlayPause,
  } = useSupportedFeatures();

  const displayPlayerName =
    mediaPlayerName || player.attributes.friendly_name || player.entity_id;
  const isStateTitle = PLAYER_STATE_TITLES.has(player.title);
  const displayTitle = isStateTitle ? displayPlayerName : player.title;
  const displaySubtitle = isStateTitle
    ? player.title
    : player.subtitle || displayPlayerName;

  const imageUrl =
    player.attributes.entity_picture_local || player.attributes.entity_picture;
  const mdiIcon = getDeviceIcon({
    icon: player.attributes.icon,
    deviceClass: player.attributes.device_class,
  });

  const volumeLevel = player.attributes.volume_level ?? 0;
  const volumeMuted = player.attributes.is_volume_muted ?? false;
  const volumeIcon = getVolumeIcon(volumeLevel, volumeMuted);

  const handleToggleMute = useCallback(() => {
    getHass().callService("media_player", "volume_mute", {
      entity_id: player.entity_id,
      is_volume_muted: !volumeMuted,
    });
  }, [player.entity_id, volumeMuted]);

  const buttonAction = useCallback(
    (action: () => void) => (event: MouseEvent) => {
      event.stopPropagation();
      setLastInteraction();
      action();
    },
    [setLastInteraction]
  );

  const playPauseAction = supportsTogglePlayPause ? togglePlayback : supportsStop ? stop : undefined;

  return (
    <div css={styles.compactRoot}>
      <ha-card css={styles.compactCard}>
        <button
          type="button"
          css={styles.compactButton}
          onClick={() => {
            setLastInteraction();
            onClick();
          }}
        >
          <div css={styles.artwork}>
            <MediaImage
              imageUrl={imageUrl}
              mdiIcon={mdiIcon}
              fallbackText={displayPlayerName}
            />
          </div>
          <div css={styles.textColumn}>
            <div css={styles.title}>{displayTitle}</div>
            <div css={styles.subtitle}>{displaySubtitle}</div>
          </div>
          <div css={styles.actions}>
            {supportPreviousTrack && (
              <IconButton
                icon="mdi:skip-previous"
                size="small"
                css={styles.controlButton}
                onClick={buttonAction(previousTrack)}
              />
            )}
            {!!playPauseAction && (
              <IconButton
                icon={
                  supportsTogglePlayPause
                    ? player.state === "playing"
                      ? "mdi:pause"
                      : "mdi:play"
                    : "mdi:stop"
                }
                size="small"
                css={styles.controlButton}
                onClick={buttonAction(playPauseAction)}
              />
            )}
            {supportNextTrack && (
              <IconButton
                icon="mdi:skip-next"
                size="small"
                css={styles.controlButton}
                onClick={buttonAction(nextTrack)}
              />
            )}
            {player.state === "off" ? (
              <IconButton
                icon="mdi:power"
                size="small"
                css={styles.controlButton}
                onClick={buttonAction(togglePower)}
              />
            ) : (
              <IconButton
                icon={volumeIcon}
                size="small"
                css={styles.controlButton}
                onClick={buttonAction(handleToggleMute)}
              />
            )}
          </div>
        </button>
      </ha-card>
    </div>
  );
};
