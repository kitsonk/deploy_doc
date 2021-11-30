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

const code = css({
  ":not(pre) > code": apply
    `font-mono text-sm py-1 px-1.5 rounded text-black bg-gray-100`,
  pre: apply`font-mono text-sm p-2.5 rounded-lg text-black bg-gray-100`,
});

const smallCode = css({
  ":not(pre) > code": apply`font-mono text-xs py-0.5 px-1 rounded bg-gray-100`,
  pre: apply`font-mono text-xs p-2 my-2 rounded-lg bg-gray-100`,
});

export const largeMarkdown = apply`p-4 flex flex-col space-y-4 ${code}`;

const applyNone = apply``;

const baseStyles = {
  anchor: apply`opacity-0 group-hover:opacity-100 absolute ${anchor}`,
  body: apply`bg-gray-300`,
  bold: apply`font-bold`,
  boolean: applyNone,
  classBody: apply`flex flex-col space-y-4`,
  classMethod: applyNone,
  code: apply`font-mono my-4 p-3 rounded-lg bg-gray-50`,
  docEntry: apply`relative px-2`,
  docItem: apply`group relative py-2 px-1`,
  docItems: apply`mt-4`,
  docSubItem: apply`group relative py-2 px-1 ml-2.5`,
  docTitle: apply`text-4xl text-gray-900 font-bold mb-3`,
  error: apply`bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-6`,
  fnName: applyNone,
  keyword: applyNone,
  indent: apply`ml-4`,
  link: apply`hover:text-blue-800`,
  list: apply`list-disc list-inside ml-4`,
  logo: apply`h-16 mr-4 float-left`,
  main: apply`max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto p-6`,
  mainBox: apply`p-6 md:col-span-3 md:p-12`,
  mainHeader: apply`clear-both mb-12`,
  markdown: apply`ml-4 mr-2 py-2 text-sm ${smallCode}`,
  numberLiteral: applyNone,
  nodeClass: apply`text-green-600 mx-2`,
  nodeEnum: apply`text-green-400 mx-2`,
  nodeFunction: apply`text-green-700 mx-2`,
  nodeInterface: apply`text-green-500 mx-2`,
  nodeTypeAlias: apply`text-yellow-600 mx-2`,
  nodeVariable: apply`text-blue-600 mx-2`,
  nodeNamespace: apply`text-yellow-700 mx-2`,
  section: apply`text-2xl border-b border-gray-400 p-2 mt-1 mb-3`,
  sourceLink: apply`absolute top-0 right-0`,
  subSection: apply`text-xl p-2 mx-2.5 mt-1 mb-2.5`,
  stringLiteral: applyNone,
  subtitle: apply`h-6 text-xl font-semibold`,
  title: apply`h-10 text-3xl font-bold`,
  typeKeyword: applyNone,
  typeLink: apply`underline`,
  typeParam: applyNone,
  url: apply`hover:text-blue-800 underline`,
} as const;

export const codeBlockStyles = {
  boolean: apply`text-cyan-600`,
  classMethod: apply`text-green-700`,
  fnName: apply`text-green-700`,
  keyword: apply`text-purple-800`,
  numberLiteral: apply`text-indigo-600`,
  stringLiteral: apply`text-yellow-400`,
  typeKeyword: apply`text-cyan-600 italic`,
  typeParam: apply`text-blue-600`,
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
