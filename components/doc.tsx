/** @jsx h */
import { h } from "../deps.ts";
import type { DocNode, DocNodeFunction, DocNodeNamespace } from "../deps.ts";
import { store, StoreState } from "../shared.ts";
import { assert, take } from "../util.ts";
import type { Child } from "../util.ts";
import { ClassDoc } from "./classes.tsx";
import { asCollection, Section } from "./common.tsx";
import { EnumDoc } from "./enums.tsx";
import { ErrorMessage } from "./error.tsx";
import { FnDoc } from "./functions.tsx";
import { InterfaceDoc } from "./interfaces.tsx";
import { NamespaceDoc } from "./namespaces.tsx";
import { gtw } from "./styles.ts";
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

export function DocNodes(
  { children }: { children: Child<DocNode[]> },
) {
  const items = take(children, true);
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

export function DocEntry({ children }: { children: Child<string> }) {
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
