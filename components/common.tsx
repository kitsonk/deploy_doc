/** @jsx h */
import { apply, Component, comrak, css, h, theme, tw } from "../deps.ts";
import type {
  CSSRules,
  Directive,
  DocNode,
  DocNodeClass,
  DocNodeEnum,
  DocNodeFunction,
  DocNodeImport,
  DocNodeInterface,
  DocNodeModuleDoc,
  DocNodeNamespace,
  DocNodeTypeAlias,
  DocNodeVariable,
  JsDoc,
  Location,
} from "../deps.ts";
import { store } from "../shared.ts";
import type { StoreState } from "../shared.ts";
import { getStyle } from "./styles.ts";
import { assert } from "../util.ts";

export const TARGET_RE = /(\s|[\[\]])/g;

export interface DocNodeCollection {
  moduleDoc?: DocNodeModuleDoc[];
  import?: DocNodeImport[];
  namespace?: DocNodeNamespace[];
  class?: DocNodeClass[];
  enum?: DocNodeEnum[];
  variable?: DocNodeVariable[];
  function?: DocNodeFunction[];
  interface?: DocNodeInterface[];
  typeAlias?: DocNodeTypeAlias[];
}

interface MarkdownProps {
  jsDoc?: JsDoc;
  style?: Directive<CSSRules>;
}

export interface NodesProps<N extends DocNode> {
  nodes: N[];
  path?: string[];
}

export interface NodeProps<N extends DocNode> {
  node: N;
  path?: string[];
}

export interface NodeItemsProps<Node extends DocNode, Items> {
  node: Node;
  items: Items[];
}

export const code = apply`font-mono p-2 bg-gray-900 rounded text-white`;
export const docItem = apply`group relative`;
export const entryTitle = apply
  `text-3xl border-b border-gray-800 p-2 mt-2 mb-4`;
const keyword = apply`text-purple-500 font-medium`;
export const section = apply
  `group relative text-2xl border-b border-gray-400 p-2 mt-1 mb-3`;
export const smallMarkdown = apply`ml-4 mr-2 py-2 text-sm`;

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

export const defaultPrintTheme = {
  keyword: apply``,
};

export type PrintTheme = typeof defaultPrintTheme;

export const codeBlockPrintTheme: PrintTheme = {
  keyword,
};

export function asCollection(entries: DocNode[]): DocNodeCollection {
  const collection: DocNodeCollection = {};
  for (const entry of entries) {
    if (!collection[entry.kind]) {
      collection[entry.kind] = [];
    }
    // deno-lint-ignore no-explicit-any
    collection[entry.kind]!.push(entry as any);
  }
  return collection;
}

export function byName(a: DocNode, b: DocNode) {
  return a.name.localeCompare(b.name);
}

export function getName(node: DocNode, path?: string[]): string {
  return path ? [...path, node.name].join(".") : node.name;
}

export function Anchor({ name }: { name: string }) {
  return (
    <a
      href={`#${name}`}
      class={tw`opacity-0 group-hover:opacity-100 absolute ${anchor}`}
      aria-label="Anchor"
    >
      §
    </a>
  );
}

export function BreadCrumbs(
  { source, path, item }: { source: string; path: string[]; item: string },
) {
  return (
    <ol class={tw`flex`}>
      <li>{source}</li>
      {path.map((p) => <li>{p}</li>)}
      <li>{item}</li>
    </ol>
  );
}

await comrak.init();

export function Markdown(
  { jsDoc, style = smallMarkdown }: MarkdownProps,
) {
  if (!jsDoc || !jsDoc.doc) {
    return;
  }
  const text = comrak.markdownToHTML(jsDoc.doc, {
    extension: {
      autolink: true,
      descriptionLists: true,
      strikethrough: true,
      table: true,
      tagfilter: true,
    },
  });
  return <div class={tw`${style}`}>{text}</div>;
}

export class Node<N extends DocNode> extends Component<NodeProps<N>> {
  store = store.use();
}

export class NodeLink extends Node<DocNode> {
  render() {
    const { node, path } = this.props;
    const { url } = this.store.state as StoreState;
    const href = `/${url.replace("://", "/")}${url.endsWith("/") ? "" : "/"}~/${
      [...path ?? [], node.name].join(".")
    }`;
    return <a href={href}>{node.name}</a>;
  }
}

// deno-lint-ignore no-explicit-any
export function EntryTitle({ children }: { children: any }) {
  return <h1 class={tw`${getStyle("entryTitle")}`}>{children}</h1>;
}

export function Section({ children }: { children?: string | string[] }) {
  assert(children);
  const id = (Array.isArray(children) ? children[0] : children).replaceAll(
    TARGET_RE,
    "_",
  );
  return (
    <h2 class={tw`${section}`} id={id}>
      <Anchor name={id} />
      {children}
    </h2>
  );
}

export function SourceLink({ location }: { location?: Location }) {
  if (!location) {
    return;
  }
  let href;
  try {
    const url = new URL(location.filename);
    url.hash = `L${location.line}`;
    href = url.toString();
  } catch {
    return;
  }
  return (
    <div class={tw`absolute top-0 right-0`}>
      <a href={href} target="_blank">[src]</a>
    </div>
  );
}
