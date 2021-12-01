/** @jsx h */
import { h, tw } from "../deps.ts";

type Color =
  | "black"
  | "white"
  | "gray"
  | "red"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "indigo"
  | "purple"
  | "pink";

export function Tag(
  { children, color = "gray" }: { children: unknown; color?: Color },
) {
  return (
    <span
      class={tw
        `px-2 inline-flex text-xs leading-5 font-semibold lowercase rounded-full bg-${color}-100 text-${color}-800`}
    >
      {children}
    </span>
  );
}
