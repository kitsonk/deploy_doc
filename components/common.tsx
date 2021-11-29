/** @jsx h */
import { comrak, h, tw } from "../deps.ts";
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

export function asCollection(
  entries: DocNode[],
  includePrivate = false,
): DocNodeCollection {
  const collection: DocNodeCollection = {};
  for (const entry of entries) {
    if (includePrivate || entry.declarationKind !== "private") {
      const docNodes: DocNode[] = collection[entry.kind] ??
        (collection[entry.kind] = []);
      docNodes.push(entry);
    }
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

export function DocWithLink(
  { children, location }: {
    children: unknown;
    location?: Location;
  },
) {
  let href;
  if (location) {
    try {
      const url = new URL(location.filename);
      url.hash = `L${location.line}`;
      href = url.toString();
    } catch {
      // we just swallow here
    }
  }
  return (
    <div class={tw`flex justify-between`}>
      <div class={tw`overflow-auto font-mono break-words`}>{children}</div>
      {href &&
        (
          <a
            href={href}
            target="_blank"
            class={tw
              `pl-2 break-words text-gray-600 hover:text-gray-800 hover:underline`}
          >
            [src]
          </a>
        )}
    </div>
  );
}

// export function SourceLink({ children }: { children: Child<Location> }) {
//   const { filename, line } = take(children);
//   let href;
//   try {
//     const url = new URL(filename);
//     url.hash = `L${line}`;
//     href = url.toString();
//   } catch {
//     return;
//   }
//   return (
//     <div class={gtw("sourceLink")}>
//       <a href={href} target="_blank">[src]</a>
//     </div>
//   );
// }

export function IconLink() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fas"
      data-icon="link"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      class={tw`h-3 mr-1 inline-block`}
    >
      <path
        fill="currentColor"
        d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"
      >
      </path>
    </svg>
  );
}

export function TocLink(
  { children, id }: { children: Child<string>; id?: string },
) {
  const name = take(children);
  const href = (id ?? name).replaceAll(TARGET_RE, "_");
  return (
    <li>
      <a href={`#${href}`} class={tw`truncate`}>{name}</a>
    </li>
  );
}
