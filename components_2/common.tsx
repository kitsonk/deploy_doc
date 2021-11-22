/** @jsx h */
import { comrak, h } from "../deps.ts";
import type { DocNode, JsDoc, Location } from "../deps.ts";
import { take } from "../util.ts";
import { store } from "../shared.ts";
import type { StoreState } from "../shared.ts";
import { gtw } from "./styles.ts";
import type { StyleOverride } from "./styles.ts";

export interface DocProps<Node extends DocNode> {
  children: Node | Node[];
  path?: string[];
}

export const TARGET_RE = /(\s|[\[\]])/g;

function getName(node: DocNode, path?: string[]) {
  return path ? [...path, node.name].join(".") : node.name;
}

export function Anchor({ children: name }: { children: string }) {
  return <a href={`#${name}`} class={gtw("anchor")} aria-label="Anchor">§</a>;
}

export function DocTitle(
  { children, path }: { children: DocNode | DocNode[]; path?: string[] },
) {
  const node = take(children);
  return <h1 class={gtw("docTitle")}>{getName(node, path)}</h1>;
}

await comrak.init();

interface MarkdownProps {
  children?: JsDoc | JsDoc[];
  style?: StyleOverride;
}

export function Markdown({ children, style }: MarkdownProps) {
  const jsDoc = take(children ?? []);
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
  return <div class={gtw("markdown", style)}>{text}</div>;
}

interface NodeLinkProps {
  children: DocNode | DocNode[];
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

export function SectionTitle({ children }: { children: string | string[] }) {
  const name = take(children);
  const id = name.replaceAll(TARGET_RE, "_");
  return (
    <h2 class={gtw("section")} id={id}>
      <Anchor>{id}</Anchor>
      {name}
    </h2>
  );
}

export function SourceLink({ children }: { children: Location | [Location] }) {
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
