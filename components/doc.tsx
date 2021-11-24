/** @jsx h */
import { h, tw } from "../deps.ts";
import type { DocNode, DocNodeFunction, DocNodeNamespace } from "../deps.ts";
import { store, StoreState } from "../shared.ts";
import { assert, take } from "../util.ts";
import type { Child } from "../util.ts";
import { ClassDoc } from "./classes.tsx";
import { asCollection, Markdown, Section, TARGET_RE } from "./common.tsx";
import type { DocNodeCollection } from "./common.tsx";
import { EnumDoc } from "./enums.tsx";
import { ErrorMessage } from "./error.tsx";
import { FnDoc } from "./functions.tsx";
import { InterfaceDoc } from "./interfaces.tsx";
import { NamespaceDoc } from "./namespaces.tsx";
import { gtw, largeMarkdownStyles } from "./styles.ts";
import { TypeAliasDoc } from "./types.tsx";
import { VariableDoc } from "./variables.tsx";

function assertAll<N extends DocNode>(
  nodes: DocNode[],
  kind: DocNode["kind"],
): asserts nodes is N[] {
  if (!nodes.every((n) => n.kind === kind)) {
    throw new Error(`Not every node of kind "${kind}".`);
  }
}

function TocLink({ children }: { children: Child<string> }) {
  const name = take(children);
  const id = name.replaceAll(TARGET_RE, "_");
  return (
    <li>
      <a href={`#${id}`}>{name}</a>
    </li>
  );
}

function ModuleToc({ children }: { children: Child<DocNodeCollection> }) {
  const collection = take(children);
  return (
    <ul>
      {collection.namespace && <TocLink>Namespaces</TocLink>}
      {collection.class && <TocLink>Classes</TocLink>}
      {collection.enum && <TocLink>Enums</TocLink>}
      {collection.variable && <TocLink>Variables</TocLink>}
      {collection.function && <TocLink>Functions</TocLink>}
      {collection.interface && <TocLink>Interfaces</TocLink>}
      {collection.typeAlias && <TocLink>Types</TocLink>}
    </ul>
  );
}

function DocNodes({ children }: { children: Child<DocNodeCollection> }) {
  const collection = take(children);
  return (
    <div class={gtw("mainBox")}>
      {collection.moduleDoc && (
        <Markdown style={largeMarkdownStyles}>
          {collection.moduleDoc[0].jsDoc}
        </Markdown>
      )}
      {collection.namespace && (
        <Section title="Namespaces" style="nodeNamespace">
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

function DocEntry({ children }: { children: Child<string> }) {
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
    case "enum":
      assert(nodes.length === 1);
      return <EnumDoc path={path}>{nodes[0]}</EnumDoc>;
    case "function":
      assertAll<DocNodeFunction>(nodes, "function");
      return <FnDoc path={path}>{nodes}</FnDoc>;
    case "interface":
      assert(nodes.length === 1);
      return <InterfaceDoc path={path}>{nodes[0]}</InterfaceDoc>;
    case "namespace":
      assert(nodes.length === 1);
      return <NamespaceDoc path={path}>{nodes[0]}</NamespaceDoc>;
    case "typeAlias":
      assert(nodes.length === 1);
      return <TypeAliasDoc path={path}>{nodes[0]}</TypeAliasDoc>;
    case "variable":
      assert(nodes.length === 1);
      return <VariableDoc path={path}>{nodes[0]}</VariableDoc>;
    default:
      return (
        <ErrorMessage title="Not Supported">
          The kind of "{nodes[0].kind}" is currently not supported.
        </ErrorMessage>
      );
  }
}

export function DocPage(
  { children }: { children: Child<string | null | undefined> },
) {
  const item = take(children);
  const { entries } = store.state as StoreState;
  const collection = asCollection(entries);
  return (
    <div
      class={tw`max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-4`}
    >
      <SideBar item={item}>{collection}</SideBar>
      {item ? <DocEntry>{item}</DocEntry> : <DocNodes>{collection}</DocNodes>}
    </div>
  );
}

function SideBar(
  { children, item }: {
    children: Child<DocNodeCollection>;
    item?: string | null;
  },
) {
  const collection = take(children);
  return (
    <nav class={tw`p-6 sm:py-12 md:border-r md:border-gray-200`}>
      <h2 class={tw`text-gray-900 text-2xl font-bold`}>{item ?? "Deno Doc"}</h2>
      {item ?? <ModuleToc>{collection}</ModuleToc>}
    </nav>
  );
}
