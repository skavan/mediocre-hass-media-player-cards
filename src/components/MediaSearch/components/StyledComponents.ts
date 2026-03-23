import { theme } from "@constants";
import { css } from "@emotion/react";

export const searchStyles = {
  root: css({
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    overflow: "hidden",
  }),
  rootSearchBarBottom: css({
    overflow: "hidden",
  }),
  searchBarContainer: css({
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 8,
  }),
  chipRow: css({
    display: "flex",
    flexDirection: "row",
    gap: "6px",
    justifyContent: "flex-start",
    padding: "0px var(--mmpc-search-padding, 0px)",
  }),
  scrollingChipRow: css({
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: "6px",
    justifyContent: "flex-start",
    overflowX: "auto",
    overflowY: "hidden",
    padding: "0px var(--mmpc-search-padding, 0px) 4px",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "thin",
    scrollbarColor: "var(--divider-color) transparent",
    "&::-webkit-scrollbar": {
      height: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "var(--divider-color)",
      borderRadius: "999px",
    },
  }),
  chip: css({
    flexShrink: 0,
  }),
  verticalChipSeperator: css({
    height: "28px",
    alignSelf: "center",
    borderRight: "1px solid var(--divider-color)",
    marginRight: "6px",
  }),
  mediaEmptyText: css({
    color: theme.colors.onCard,
    padding: "0px var(--mmpc-search-padding, 0px)",
  }),
  resultsContainerSearchBarBottom: css({
    overflowY: "auto",
  }),
  inputRow: css({
    display: "flex",
    flexDirection: "row",
    gap: "8px",
    padding: "1px var(--mmpc-search-padding, 0px)",
  }),
  input: css({
    flexGrow: 1,
  }),
  modeText: css({
    color: theme.colors.onCard,
    opacity: 0.72,
    fontSize: "12px",
    lineHeight: 1.3,
    padding: "0px var(--mmpc-search-padding, 0px)",
  }),
};
