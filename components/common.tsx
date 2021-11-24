/** @jsx h */
import { comrak, h } from "../deps.ts";
import type {
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
import { take } from "../util.ts";
import type { Child } from "../util.ts";
import { store } from "../shared.ts";
import type { StoreState } from "../shared.ts";
import { gtw } from "./styles.ts";
import type { BaseStyles, StyleOverride } from "./styles.ts";

interface DocNodeCollection {
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

export interface DocProps<Node extends DocNode> {
  children: Child<Node>;
  path?: string[];
}

export interface NodeProps<Node extends DocNode> {
  children: Child<Node>;
  path?: string[];
  style: BaseStyles;
}

interface NodesProps<Node extends DocNode> {
  children: Child<Node[]>;
  path?: string[];
  style: BaseStyles;
  title: string;
}

export const TARGET_RE = /(\s|[\[\]])/g;

export function asCollection(entries: DocNode[]): DocNodeCollection {
  const collection: DocNodeCollection = {};
  for (const entry of entries) {
    const docNodes: DocNode[] = collection[entry.kind] ??
      (collection[entry.kind] = []);
    docNodes.push(entry);
  }
  return collection;
}

function byName(a: DocNode, b: DocNode) {
  return a.name.localeCompare(b.name);
}

function getName(node: DocNode, path?: string[]) {
  return path ? [...path, node.name].join(".") : node.name;
}

export function Anchor({ children: name }: { children: string }) {
  return <a href={`#${name}`} class={gtw("anchor")} aria-label="Anchor">§</a>;
}

export function DocTitle(
  { children, path }: { children: Child<DocNode>; path?: string[] },
) {
  const node = take(children);
  return <h1 class={gtw("docTitle")}>{getName(node, path)}</h1>;
}

await comrak.init();

interface MarkdownProps {
  children: Child<JsDoc | undefined>;
  style?: StyleOverride;
}

function Entry<Node extends DocNode>(
  { children, path, style }: NodeProps<Node>,
) {
  const node = take(children);
  return (
    <li>
      <h3 class={gtw(style)}>
        <NodeLink path={path}>{node}</NodeLink>
      </h3>
      <Markdown>{node.jsDoc}</Markdown>
    </li>
  );
}

export function Markdown({ children, style }: MarkdownProps) {
  const jsDoc = take(children);
  if (!jsDoc) {
    return;
  }
  const text = jsDoc.doc
    ? comrak.markdownToHTML(jsDoc.doc, {
      extension: {
        autolink: true,
        descriptionLists: true,
        strikethrough: true,
        table: true,
        tagfilter: true,
      },
    })
    : undefined;
  if (!text) {
    return;
  }
  // if (jsDoc.tags) {
  //   for (const tag of jsDoc.tags) {
  //     switch (tag.kind) {
  //       case "callback":
  //         tag;
  //     }
  //   }
  // }
  return <div class={gtw("markdown", style)}>{text}</div>;
}

interface NodeLinkProps {
  children: Child<DocNode>;
  path?: string[];
}

export function NodeLink({ children, path }: NodeLinkProps) {
  const node = take(children);
  const { url } = store.state as StoreState;
  const href = `/${url.replace("://", "/")}${url.endsWith("/") ? "" : "/"}~/${
    [...path ?? [], node.name].join(".")
  }`;
  return <a href={href}>{node.name}</a>;
}

export function SectionTitle({ children }: { children: Child<string> }) {
  const name = take(children);
  const id = name.replaceAll(TARGET_RE, "_");
  return (
    <h2 class={gtw("section")} id={id}>
      <Anchor>{id}</Anchor>
      {name}
    </h2>
  );
}

export function Section<Node extends DocNode>(
  { children, path, style, title }: NodesProps<Node>,
) {
  const nodes = take(children);
  const items = nodes.sort(byName).map((node) => (
    <Entry path={path} style={style}>
      {node}
    </Entry>
  ));
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <ul>{items}</ul>
    </div>
  );
}

export function SourceLink({ children }: { children: Child<Location> }) {
  const { filename, line } = take(children);
  let href;
  try {
    const url = new URL(filename);
    url.hash = `L${line}`;
    href = url.toString();
  } catch {
    return;
  }
  return (
    <div class={gtw("sourceLink")}>
      <a href={href} target="_blank">[src]</a>
    </div>
  );
}
