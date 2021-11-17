import { apply, css } from "../deps.ts";
import type { CSSRules, Directive } from "../deps.ts";

const markdown = css({
  ":not(pre) > code": apply`text-sm p-1 rounded text-white bg-gray-700`,
  pre: apply`text-sm m-2 p-2 rounded text-white bg-gray-700`,
});

export const largeMarkdown = apply
  `mt-4 mb-8 mx-2 flex flex-col space-y-4 ${markdown}`;

const baseStyles = {
  entryTitle: apply`text-3xl border-b border-gray-800 p-2 mt-2 mb-4`,
  error: apply`bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-6`,
  keyword: apply``,
  largeMarkdown: largeMarkdown,
  logo: apply`h-16 mr-4 float-left`,
  main: apply`max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto p-6`,
  mainBox: apply`w-full bg-gray-50 rounded-lg px-8 pt-4 pb-8`,
  markdown: markdown,
  subtitle: apply`h-6 text-xl font-semibold`,
  title: apply`h-10 text-3xl font-bold`,
} as const;

type BaseStyles = keyof typeof baseStyles;

export function getStyle(
  key: BaseStyles,
  ...overrides: Record<BaseStyles, Directive<CSSRules>>[]
): Directive<CSSRules> {
  for (const override of overrides) {
    const style = override[key];
    if (style) {
      return style;
    }
  }
  return baseStyles[key];
}
