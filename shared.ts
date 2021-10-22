import type { PrintTheme } from "./components/common.tsx";
import {
  getState as nanoGetSate,
  setState as nanoSetState,
  setup,
  Store,
  twColors,
  virtualSheet,
} from "./deps.ts";
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

export const PRINT_THEME = "printer_styles";

interface GetState {
  (id: typeof PRINT_THEME): PrintTheme | undefined;
  // deno-lint-ignore no-explicit-any
  (id: string): any;
}

interface SetState {
  // deno-lint-ignore no-explicit-any
  (id: typeof PRINT_THEME, value: PrintTheme | undefined): Map<string, any>;
  // deno-lint-ignore no-explicit-any
  (id: string, value: any): Map<string, any>;
}

export const getState = nanoGetSate as GetState;
export const setState = nanoSetState as SetState;
