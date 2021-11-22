/** @jsx h */
import { h } from "../deps.ts";
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
} from "../deps.ts";
import { store, StoreState } from "../shared.ts";
import { assert, take } from "../util.ts";
import { ClassDoc } from "./classes.tsx";
import { Markdown, NodeLink, SectionTitle } from "./common.tsx";
import { ErrorMessage } from "./error.tsx";
import { gtw } from "./styles.ts";
import type { BaseStyles } from "./styles.ts";

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

export interface NodeProps<Node extends DocNode> {
  children: Node | Node[];
  path?: string[];
  style: BaseStyles;
}

interface NodesProps<Node extends DocNode> {
  children: Node[] | Node[][];
  path?: string[];
  style: BaseStyles;
  title: string;
}

function asCollection(entries: DocNode[]): DocNodeCollection {
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

function Section<Node extends DocNode>(
  { children, path, style, title }: NodesProps<Node>,
) {
  const nodes = take<Node[]>(children);
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

export function DocNodes(
  { children }: { children: DocNode[] | DocNode[][] },
) {
  const items = take<DocNode[]>(children, true);
  const collection = asCollection(items);
  console.log("DocPrinter", children.length, collection.namespace?.length);
  return (
    <div class={gtw("mainBox")}>
      {collection.namespace && (
        <Section title="Namespace" style="nodeNamespace">
          {collection.namespace}
        </Section>
      )}
      {collection.class && (
        <Section title="Classes" style="nodeClass">
          {collection.class}
        </Section>
      )}
      {collection.enum && (
        <Section title="Enums" style="nodeEnum">
          {collection.enum}
        </Section>
      )}
      {collection.variable && (
        <Section title="Variables" style="nodeVariable">
          {collection.variable}
        </Section>
      )}
      {collection.function && (
        <Section title="Functions" style="nodeFunction">
          {collection.function}
        </Section>
      )}
      {collection.interface && (
        <Section title="Interfaces" style="nodeInterface">
          {collection.interface}
        </Section>
      )}
      {collection.typeAlias && (
        <Section title="Types" style="nodeTypeAlias">
          {collection.typeAlias}
        </Section>
      )}
    </div>
  );
}

interface DocEntryParams {
  children: string | string[];
}

export function DocEntry({ children }: DocEntryParams) {
  const item = take(children);
  const path = item.split(".");
  const name = path.pop()!;
  let { entries, url } = store.state as StoreState;
  if (path && path.length) {
    for (const name of path) {
      const namespace = entries.find((n) =>
        n.kind === "namespace" && n.name === name
      ) as DocNodeNamespace | undefined;
      if (namespace) {
        entries = namespace.namespaceDef.elements;
      }
    }
  }
  const nodes = entries.filter((e) => e.name === name && e.kind !== "import");
  if (!nodes.length) {
    return (
      <ErrorMessage title="Entry not found">
        The document entry named "{path ? [...path, name].join(".") : name}" was
        not found in specifier "{url}".
      </ErrorMessage>
    );
  }
  switch (nodes[0].kind) {
    case "class":
      assert(nodes.length === 1);
      return <ClassDoc path={path}>{nodes[0]}</ClassDoc>;
    default:
      return (
        <ErrorMessage title="Not Supported">
          The kind of "{nodes[0].kind}" is currently not supported.
        </ErrorMessage>
      );
  }
}
