import { apply, css, theme, tw } from "../deps.ts";
import type { CSSRules, Directive } from "../deps.ts";

const anchor = css({
  ":global": {
    ":target, :target > *": {
      "background-color": theme("colors.gray.200"),
    },
  },
  "color": theme("colors.gray.600"),
  "background-color": "transparent",
  "margin-left": "-1em",
  "padding-right": "0.5em",
});

const markdown = css({
  ":not(pre) > code": apply`text-sm p-1 rounded text-white bg-gray-700`,
  pre: apply`text-sm m-2 p-2 rounded text-white bg-gray-700`,
});

export const largeMarkdown = apply
  `mt-4 mb-8 mx-2 flex flex-col space-y-4 ${markdown}`;

const applyNone = apply``;

const baseStyles = {
  anchor: apply`opacity-0 group-hover:opacity-100 absolute ${anchor}`,
  body: apply`bg-gray-300`,
  bold: apply`font-bold`,
  boolean: applyNone,
  classBody: apply`flex flex-col space-y-4`,
  classMethod: applyNone,
  code: apply`font-mono p-2 bg-gray-900 rounded text-white`,
  docEntry: apply`relative px-2`,
  docItem: apply`group relative`,
  docItems: apply`mt-4`,
  docTitle: apply`text-3xl border-b border-gray-800 p-2 mt-2 mb-4`,
  error: apply`bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-6`,
  keyword: apply``,
  indent: apply`ml-4`,
  link: apply`hover:text-blue-800`,
  list: apply`text-sm list-disc list-inside ml-4`,
  logo: apply`h-16 mr-4 float-left`,
  main: apply`max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto p-6`,
  mainBox: apply`w-full bg-gray-50 rounded-lg px-8 pt-4 pb-8`,
  mainHeader: apply`clear-both mb-12`,
  markdown: apply`ml-4 mr-2 py-2 text-sm`,
  numberLiteral: applyNone,
  nodeClass: apply`text-green-600 mx-2`,
  nodeEnum: apply`text-green-400 mx-2`,
  nodeFunction: apply`text-green-700 mx-2`,
  nodeInterface: apply`text-green-500 mx-2`,
  nodeTypeAlias: apply`text-yellow-600 mx-2`,
  nodeVariable: apply`text-blue-600 mx-2`,
  nodeNamespace: apply`text-yellow-700 mx-2`,
  section: apply
    `group relative text-2xl border-b border-gray-400 p-2 mt-1 mb-3`,
  sourceLink: apply`absolute top-0 right-0`,
  stringLiteral: applyNone,
  subtitle: apply`h-6 text-xl font-semibold`,
  title: apply`h-10 text-3xl font-bold`,
  typeKeyword: applyNone,
  typeLink: apply`underline`,
  typeParam: applyNone,
  url: apply`hover:text-blue-800`,
} as const;

export const codeBlockStyles = {
  boolean: apply`text-cyan-500`,
  classMethod: apply`text-green-500`,
  keyword: apply`text-purple-500`,
  numberLiteral: apply`text-indigo-500`,
  stringLiteral: apply`text-yellow-200`,
  typeKeyword: apply`text-cyan-400 italic`,
  typeParam: apply`text-blue-400`,
} as const;

export const largeMarkdownStyles = {
  markdown: largeMarkdown,
} as const;

export type BaseStyles = keyof typeof baseStyles;
export type StyleOverride = Partial<Record<BaseStyles, Directive<CSSRules>>>;

export function getStyle(
  key: BaseStyles,
  ...overrides: (StyleOverride | undefined)[]
): Directive<CSSRules> {
  for (const override of overrides) {
    if (!override) {
      continue;
    }
    const style = override[key];
    if (style) {
      return style;
    }
  }
  return baseStyles[key];
}

/** Get a twind style, applying any overrides. */
export function gtw(
  key: BaseStyles,
  ...overrides: (StyleOverride | undefined)[]
) {
  return tw`${getStyle(key, ...overrides)}`;
}
