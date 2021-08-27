/** @jsx h */
import { apply, Component, h, rustyMarkdown, tw } from "../deps.ts";
import type {
  CSSRules,
  Directive,
  DocNode,
  DocNodeClass,
  DocNodeEnum,
  DocNodeFunction,
  DocNodeImport,
  DocNodeInterface,
  DocNodeNamespace,
  DocNodeTypeAlias,
  DocNodeVariable,
} from "../deps.ts";
import { store } from "../shared.ts";
import type { StoreState } from "../shared.ts";

export interface DocNodeCollection {
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
  jsDoc?: string;
  style?: Directive<CSSRules>;
  tags?: string[];
}

export interface NodesProps<N extends DocNode> {
  nodes: N[];
  path?: string[];
}

export interface NodeProps<N extends DocNode> {
  node: N;
  path?: string[];
}

export const code = apply`font-mono p-2 bg-gray-900 rounded text-white`;
export const entryTitle = apply
  `text-3xl border-b border-gray-800 py-2 mt-2 mb-4`;
export const keyword = apply`text-purple-500 font-medium`;
export const largeMarkdown = apply`mt-4 mb-8 flex flex-col space-y-4`;
export const mainBox = apply`w-full bg-gray-200 rounded-lg px-8 pt-4 pb-8`;
export const section = apply`text-2xl border-b border-gray-400 py-2 mt-1 mb-3`;
export const smallMarkdown = apply`ml-4 mr-2 py-2 text-sm`;

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

export function Markdown(
  { jsDoc, style = smallMarkdown, tags = [] }: MarkdownProps,
) {
  if (!jsDoc) {
    return;
  }
  const value = jsDoc.split("\n").filter((line) => {
    if (line.startsWith("@")) {
      tags.push(line);
      return false;
    }
    return true;
  }).join("\n");
  const tokens = rustyMarkdown.tokens(value, {
    tables: true,
    strikethrough: true,
    smartPunctuation: true,
  });
  return (
    <div class={tw`${style}`}>
      {rustyMarkdown.html(tokens)}
    </div>
  );
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
