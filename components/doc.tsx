/** @jsx h */
/** @jsxFrag Fragment */
import { Component, h, tw } from "../deps.ts";
import type { DocNodeNamespace } from "../deps.ts";
import { store } from "../shared.ts";
import type { StoreState } from "../shared.ts";
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
    const entry = entries.find((e) => e.name === name);
    if (!entry) {
      return (
        <ErrorMessage title="Entry not found">
          The document entry named "{path ? [...path, name].join(".") : name}"
          was not found in specifier "{url}".
        </ErrorMessage>
      );
    }
    switch (entry.kind) {
      case "class":
        return <ClassEntry node={entry} path={path} />;
      case "enum":
        return <EnumEntry node={entry} path={path} />;
      case "function":
        return <FnEntry node={entry} path={path} />;
      case "interface":
        return <InterfaceEntry node={entry} path={path} />;
      case "namespace":
        return <NamespaceEntry node={entry} path={path} />;
      case "typeAlias":
        return <TypeAliasEntry node={entry} path={path} />;
      case "variable":
        return <VariableEntry node={entry} path={path} />;
      default:
        return (
          <ErrorMessage title="Not Supported">
            The kind of "{entry.kind}" is currently not supported.
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
