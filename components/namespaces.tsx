/** @jsx h */
import { h, tw } from "../deps.ts";
import type { DocNodeNamespace } from "../deps.ts";
import { Classes } from "./classes.tsx";
import {
  asCollection,
  byName,
  entryTitle,
  getName,
  largeMarkdown,
  mainBox,
  Markdown,
  Node,
  NodeLink,
  Section,
} from "./common.tsx";
import type { NodeProps, NodesProps } from "./common.tsx";
import { Enums } from "./enums.tsx";
import { Fns } from "./functions.tsx";
import { Interfaces } from "./interfaces.tsx";
import { TypeAliases } from "./type_aliases.tsx";
import { Variables } from "./variables.tsx";

class NamespaceNode extends Node<DocNodeNamespace> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-yellow-700 mx-2`}>
          <NodeLink node={node} path={path} />
        </h3>
        <Markdown jsDoc={node.jsDoc} />
      </li>
    );
  }
}

export function Namespaces({ nodes, path }: NodesProps<DocNodeNamespace>) {
  const items = nodes.sort(byName).map((node) => (
    <NamespaceNode node={node} path={path} />
  ));
  return (
    <div>
      <Section>Namespaces</Section>
      <ul>{items}</ul>
    </div>
  );
}

export function NamespaceEntry(
  { node, path = [] }: NodeProps<DocNodeNamespace>,
) {
  const collection = asCollection(node.namespaceDef.elements);
  const currentPath = [...path, node.name];
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{getName(node, path)}</h1>
      <Markdown jsDoc={node.jsDoc} style={largeMarkdown} />
      {collection.namespace &&
        <Namespaces nodes={collection.namespace} path={currentPath} />}
      {collection.class &&
        <Classes nodes={collection.class} path={currentPath} />}
      {collection.enum && <Enums nodes={collection.enum} path={currentPath} />}
      {collection.variable &&
        <Variables nodes={collection.variable} path={currentPath} />}
      {collection.function &&
        <Fns nodes={collection.function} path={currentPath} />}
      {collection.interface &&
        <Interfaces nodes={collection.interface} path={currentPath} />}
      {collection.typeAlias &&
        <TypeAliases nodes={collection.typeAlias} path={currentPath} />}
    </div>
  );
}
