import { setup, Store, twColors, virtualSheet } from "./deps.ts";
import type { DocNode } from "./deps.ts";

export const store = new Store({
  entries: [],
  url: "",
});

export interface StoreState {
  entries: DocNode[];
  url: string;
}

export const sheet = virtualSheet();
setup({
  sheet,
  theme: {
    backgroundSize: {
      "4": "1rem",
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: twColors.black,
      white: twColors.white,
      gray: twColors.coolGray,
      red: twColors.red,
      yellow: twColors.amber,
      green: twColors.emerald,
      cyan: twColors.cyan,
      blue: twColors.lightBlue,
      indigo: twColors.indigo,
      purple: twColors.fuchsia,
      pink: twColors.pink,
    },
  },
});
