/** @jsx h */
/** @jsxFrag Fragment */
import { Component, h, tw } from "../deps.ts";
import type { DocNode, DocNodeFunction, DocNodeNamespace } from "../deps.ts";
import { store } from "../shared.ts";
import type { StoreState } from "../shared.ts";
import { assert } from "../util.ts";
import { ClassEntry, Classes } from "./classes.tsx";
import { asCollection, mainBox } from "./common.tsx";
import { EnumEntry, Enums } from "./enums.tsx";
import { ErrorMessage } from "./error.tsx";
import { FnEntry, Fns } from "./functions.tsx";
import { InterfaceEntry, Interfaces } from "./interfaces.tsx";
import { NamespaceEntry, Namespaces } from "./namespaces.tsx";
import { TypeAliasEntry, TypeAliases } from "./type_aliases.tsx";
import { VariableEntry, Variables } from "./variables.tsx";

type EmptyProps = Record<string, never>;

interface DocEntryParams {
  item: string;
}

function assertAll<N extends DocNode>(
  nodes: DocNode[],
  kind: DocNode["kind"],
): asserts nodes is N[] {
  if (!nodes.every((n) => n.kind === kind)) {
    throw new Error(`Not every node of kind "${kind}".`);
  }
}

export class DocEntry extends Component<DocEntryParams> {
  store = store.use();

  render() {
    const { item } = this.props;
    const path = item.split(".");
    const name = path.pop()!;
    let { entries, url } = this.store.state as StoreState;
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
          The document entry named "{path ? [...path, name].join(".") : name}"
          was not found in specifier "{url}".
        </ErrorMessage>
      );
    }
    switch (nodes[0].kind) {
      case "class":
        assert(nodes.length === 1);
        return <ClassEntry node={nodes[0]} path={path} />;
      case "enum":
        assert(nodes.length === 1);
        return <EnumEntry node={nodes[0]} path={path} />;
      case "function":
        assertAll<DocNodeFunction>(nodes, "function");
        return <FnEntry nodes={nodes} path={path} />;
      case "interface":
        assert(nodes.length === 1);
        return <InterfaceEntry node={nodes[0]} path={path} />;
      case "namespace":
        assert(nodes.length === 1);
        return <NamespaceEntry node={nodes[0]} path={path} />;
      case "typeAlias":
        assert(nodes.length === 1);
        return <TypeAliasEntry node={nodes[0]} path={path} />;
      case "variable":
        assert(nodes.length === 1);
        return <VariableEntry node={nodes[0]} path={path} />;
      default:
        return (
          <ErrorMessage title="Not Supported">
            The kind of "{nodes[0].kind}" is currently not supported.
          </ErrorMessage>
        );
    }
  }
}

export class DocPrinter extends Component<EmptyProps> {
  store = store.use();

  render() {
    const { entries } = this.store.state as StoreState;
    const collection = asCollection(entries);
    return (
      <div class={tw`${mainBox}`}>
        {collection.namespace && <Namespaces nodes={collection.namespace} />}
        {collection.class && <Classes nodes={collection.class} />}
        {collection.enum && <Enums nodes={collection.enum} />}
        {collection.variable && <Variables nodes={collection.variable} />}
        {collection.function && <Fns nodes={collection.function} />}
        {collection.interface && <Interfaces nodes={collection.interface} />}
        {collection.typeAlias && <TypeAliases nodes={collection.typeAlias} />}
      </div>
    );
  }
}
