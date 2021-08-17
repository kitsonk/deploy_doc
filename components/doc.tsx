/** @jsx h */
/** @jsxFrag Fragment */
import { apply, Component, h, rustyMarkdown, tw } from "../deps.ts";
import type {
  DocNode,
  DocNodeClass,
  DocNodeEnum,
  DocNodeFunction,
  DocNodeImport,
  DocNodeInterface,
  DocNodeKind,
  DocNodeNamespace,
  DocNodeTypeAlias,
  DocNodeVariable,
} from "../deps.ts";
import { ErrorMessage } from "./error.tsx";

interface DocNodeCollection {
  import?: DocNodeImport[];
  namespace?: DocNodeNamespace[];
  class?: DocNodeClass[];
  enum?: DocNodeEnum[];
  variable?: DocNodeVariable[];
  function?: DocNodeFunction[];
  interface?: DocNodeInterface[];
  typeAlias?: DocNodeTypeAlias[];
}

interface DocPrinterParams {
  entries: DocNode[];
  url: string;
}

function byName(a: DocNode, b: DocNode) {
  return a.name.localeCompare(b.name);
}

const section = apply`text-3xl border-b border-gray-800 py-2 mt-2 mb-4`;
const entryTitle = apply`text-3xl border-b border-gray-800 py-2 mt-2 mb-4`;
const mainBox = apply`w-full bg-gray-200 rounded-lg px-8 py-4`;

function renderMarkdown(value: string, pragmas: string[] = []) {
  value = value.split("\n").filter((line) => {
    if (line.startsWith("@")) {
      pragmas.push(line);
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
    <div class={tw`ml-4 mr-2 py-2 text-sm`}>
      {rustyMarkdown.html(tokens)}
    </div>
  );
}

function NodeLink({ node, url }: { node: DocNode; url: string }) {
  const searchParams = new URLSearchParams();
  searchParams.set("url", url);
  searchParams.set("kind", node.kind);
  searchParams.set("name", node.name);
  return <a href={`/doc?${searchParams.toString()}`}>{node.name}</a>;
}

function Class({ node, url }: { node: DocNodeClass; url: string }) {
  return (
    <li>
      <h3 class={tw`text-green-600`}>
        <NodeLink node={node} url={url} />
      </h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function Classes({ nodes, url }: { nodes: DocNodeClass[]; url: string }) {
  const items = nodes.sort(byName).map((node) =>
    <Class node={node} url={url} />
  );
  return (
    <div>
      <h2 class={tw`${section}`}>Classes</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Enum({ node, url }: { node: DocNodeEnum; url: string }) {
  return (
    <li>
      <h3 class={tw`text-green-400`}>
        <NodeLink node={node} url={url} />
      </h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function Enums({ nodes, url }: { nodes: DocNodeEnum[]; url: string }) {
  const items = nodes.sort(byName).map((node) =>
    <Enum node={node} url={url} />
  );
  return (
    <div>
      <h2 class={tw`${section}`}>Enums</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Fn({ node, url }: { node: DocNodeFunction; url: string }) {
  return (
    <li>
      <h3 class={tw`text-green-700`}>
        <NodeLink node={node} url={url} />
      </h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function Fns({ nodes, url }: { nodes: DocNodeFunction[]; url: string }) {
  const items = nodes.sort(byName).map((node) => <Fn node={node} url={url} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Functions</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Interface({ node, url }: { node: DocNodeInterface; url: string }) {
  return (
    <li>
      <h3 class={tw`text-green-500`}>
        <NodeLink node={node} url={url} />
      </h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function Interfaces(
  { nodes, url }: { nodes: DocNodeInterface[]; url: string },
) {
  const items = nodes.sort(byName).map((node) =>
    <Interface node={node} url={url} />
  );
  return (
    <div>
      <h2 class={tw`${section}`}>Interfaces</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Namespace({ node, url }: { node: DocNodeNamespace; url: string }) {
  return (
    <li>
      <h3 class={tw`text-yellow-700`}>
        <NodeLink node={node} url={url} />
      </h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function Namespaces(
  { nodes, url }: { nodes: DocNodeNamespace[]; url: string },
) {
  const items = nodes.sort(byName).map((node) =>
    <Namespace node={node} url={url} />
  );
  return (
    <div>
      <h2 class={tw`${section}`}>Namespaces</h2>
      <ul>{items}</ul>
    </div>
  );
}

function TypeAlias({ node, url }: { node: DocNodeTypeAlias; url: string }) {
  return (
    <li>
      <h3 class={tw`text-yellow-600`}>
        <NodeLink node={node} url={url} />
      </h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function TypeAliases(
  { nodes, url }: { nodes: DocNodeTypeAlias[]; url: string },
) {
  const items = nodes.sort(byName).map((node) =>
    <TypeAlias node={node} url={url} />
  );
  return (
    <div>
      <h2 class={tw`${section}`}>Type Alias</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Variable({ node, url }: { node: DocNodeVariable; url: string }) {
  return (
    <li>
      <h3 class={tw`text-blue-600`}>
        <NodeLink node={node} url={url} />
      </h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function Variables({ nodes, url }: { nodes: DocNodeVariable[]; url: string }) {
  const items = nodes.sort(byName).map((node) =>
    <Variable node={node} url={url} />
  );
  return (
    <div>
      <h2 class={tw`${section}`}>Variables</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Collection(
  { collection, url }: { collection: DocNodeCollection; url: string },
) {
  return (
    <div class={tw`${mainBox}`}>
      {collection.namespace
        ? <Namespaces nodes={collection.namespace} url={url} />
        : undefined}
      {collection.class
        ? <Classes nodes={collection.class} url={url} />
        : undefined}
      {collection.enum ? <Enums nodes={collection.enum} url={url} />
      : undefined}
      {collection.variable ? <Variables nodes={collection.variable} url={url} />
      : undefined}
      {collection.function ? <Fns nodes={collection.function} url={url} />
      : undefined}
      {collection.interface
        ? <Interfaces nodes={collection.interface} url={url} />
        : undefined}
      {collection.typeAlias
        ? <TypeAliases nodes={collection.typeAlias} url={url} />
        : undefined}
    </div>
  );
}

function asCollection(entries: DocNode[]): DocNodeCollection {
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

export class DocPrinter extends Component<DocPrinterParams> {
  render() {
    const { url, entries } = this.props;
    return <Collection url={url} collection={asCollection(entries)} />;
  }
}

interface DocEntryParams extends DocPrinterParams {
  name: string;
  kind: DocNodeKind;
}

function ClassEntry({ entry }: { entry: DocNodeClass; url: string }) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>
        Class <code>{entry.name}</code>
      </h1>
    </div>
  );
}

function EnumEntry({ entry }: { entry: DocNodeEnum; url: string }) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>
        Enum <code>{entry.name}</code>
      </h1>
    </div>
  );
}

function NamespaceEntry({ entry }: { entry: DocNodeNamespace; url: string }) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>
        Namespace <code>{entry.name}</code>
      </h1>
    </div>
  );
}

export class DocEntry extends Component<DocEntryParams> {
  render() {
    const { entries, name, kind, url } = this.props;
    const entry = entries.find((e) => e.kind === kind && e.name === name);
    if (!entry) {
      return (
        <ErrorMessage title="Entry not found">
          The document entry named "{name}" of kind "{kind}" was not found in
          specifier "{url}".
        </ErrorMessage>
      );
    }
    switch (entry.kind) {
      case "class":
        return <ClassEntry entry={entry} url={url} />;
      case "enum":
        return <EnumEntry entry={entry} url={url} />;
      case "namespace":
        return <NamespaceEntry entry={entry} url={url} />;
      default:
        return (
          <ErrorMessage title="Not Supported">
            The kind of "{kind}" is currently not supported.
          </ErrorMessage>
        );
    }
  }
}
