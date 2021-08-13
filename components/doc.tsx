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
  DocNodeNamespace,
  DocNodeTypeAlias,
  DocNodeVariable,
} from "../deps.ts";

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
}

function byName(a: DocNode, b: DocNode) {
  return a.name.localeCompare(b.name);
}

const section = apply`text-3xl border-b border-gray-800 py-2 mt-2 mb-4`;

function renderMarkdown(value: string) {
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

function Class({ node }: { node: DocNodeClass }) {
  return (
    <li>
      <h3>{node.name}</h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function Classes({ nodes }: { nodes: DocNodeClass[] }) {
  const items = nodes.sort(byName).map((node) => <Class node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Classes</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Enum({ node }: { node: DocNodeEnum }) {
  return (
    <li>
      <h3>{node.name}</h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function Enums({ nodes }: { nodes: DocNodeEnum[] }) {
  const items = nodes.sort(byName).map((node) => <Enum node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Enums</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Fn({ node }: { node: DocNodeFunction }) {
  return (
    <li>
      <h3>{node.name}</h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function Fns({ nodes }: { nodes: DocNodeFunction[] }) {
  const items = nodes.sort(byName).map((node) => <Fn node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Functions</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Import({ node }: { node: DocNodeImport }) {
  return (
    <li>
      <h3>{node.name}</h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function Imports({ nodes }: { nodes: DocNodeImport[] }) {
  const items = nodes.sort(byName).map((node) => <Import node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Imports</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Interface({ node }: { node: DocNodeInterface }) {
  return (
    <li>
      <h3>{node.name}</h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function Interfaces({ nodes }: { nodes: DocNodeInterface[] }) {
  const items = nodes.sort(byName).map((node) => <Interface node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Interfaces</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Namespace({ node }: { node: DocNodeNamespace }) {
  return (
    <li>
      <h3>{node.name}</h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function Namespaces({ nodes }: { nodes: DocNodeNamespace[] }) {
  const items = nodes.sort(byName).map((node) => <Namespace node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Namespaces</h2>
      <ul>{items}</ul>
    </div>
  );
}

function TypeAlias({ node }: { node: DocNodeTypeAlias }) {
  return (
    <li>
      <h3>{node.name}</h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function TypeAliases({ nodes }: { nodes: DocNodeTypeAlias[] }) {
  const items = nodes.sort(byName).map((node) => <TypeAlias node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Type Alias</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Variable({ node }: { node: DocNodeVariable }) {
  return (
    <li>
      <h3>{node.name}</h3>
      {node.jsDoc ? renderMarkdown(node.jsDoc) : undefined}
    </li>
  );
}

function Variables({ nodes }: { nodes: DocNodeVariable[] }) {
  const items = nodes.sort(byName).map((node) => <Variable node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Variables</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Collection({ collection }: { collection: DocNodeCollection }) {
  return (
    <div>
      {collection.import ? <Imports nodes={collection.import} /> : undefined}
      {collection.namespace
        ? <Namespaces nodes={collection.namespace} />
        : undefined}
      {collection.class ? <Classes nodes={collection.class} /> : undefined}
      {collection.enum ? <Enums nodes={collection.enum} /> : undefined}
      {collection.variable ? <Variables nodes={collection.variable} />
      : undefined}
      {collection.function ? <Fns nodes={collection.function} /> : undefined}
      {collection.interface ? <Interfaces nodes={collection.interface} />
      : undefined}
      {collection.typeAlias ? <TypeAliases nodes={collection.typeAlias} />
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
    return <Collection collection={asCollection(this.props.entries)} />;
  }
}
