import { setup, virtualSheet } from "./deps.ts";

export const sheet = virtualSheet();
setup({
  sheet,
  theme: {
    backgroundSize: {
      "4": "1rem",
    },
  },
});
