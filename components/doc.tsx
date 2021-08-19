/** @jsx h */
/** @jsxFrag Fragment */
import { apply, Component, Fragment, h, rustyMarkdown, tw } from "../deps.ts";
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
  InterfaceCallSignatureDef,
  InterfaceIndexSignatureDef,
  InterfaceMethodDef,
  InterfacePropertyDef,
  LiteralCallSignatureDef,
  LiteralIndexSignatureDef,
  LiteralMethodDef,
  LiteralPropertyDef,
  ParamArrayDef,
  ParamAssignDef,
  ParamDef,
  ParamIdentifierDef,
  ParamObjectDef,
  ParamRestDef,
  TsTypeArrayDef,
  TsTypeConditionalDef,
  TsTypeDef,
  TsTypeDefLiteral,
  TsTypeFnOrConstructorDef,
  TsTypeIndexedAccessDef,
  TsTypeIntersectionDef,
  TsTypeKeywordDef,
  TsTypeOptionalDef,
  TsTypeParamDef,
  TsTypeParenthesizedDef,
  TsTypeQueryDef,
  TsTypeRestDef,
  TsTypeThisDef,
  TsTypeTupleDef,
  TsTypeTypeLiteralDef,
  TsTypeTypeOperatorDef,
  TsTypeTypePredicateDef,
  TsTypeTypeRefDef,
  TsTypeUnionDef,
} from "../deps.ts";
import { ErrorMessage } from "./error.tsx";
import { store } from "../shared.ts";
import type { StoreState } from "../shared.ts";

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

function byName(a: DocNode, b: DocNode) {
  return a.name.localeCompare(b.name);
}

const section = apply`text-3xl border-b border-gray-800 py-2 mt-2 mb-4`;
const code = apply`font-mono p-2 bg-gray-900 rounded text-white`;
const entryTitle = apply`text-3xl border-b border-gray-800 py-2 mt-2 mb-4`;
const mainBox = apply`w-full bg-gray-200 rounded-lg px-8 pt-4 pb-8`;
const smallMarkdown = apply`ml-4 mr-2 py-2 text-sm`;
const largeMarkdown = apply`my-4`;

function renderMarkdown(
  value: string,
  style = smallMarkdown,
  pragmas: string[] = [],
) {
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
    <div class={tw`${style}`}>
      {rustyMarkdown.html(tokens)}
    </div>
  );
}

type EmptyProps = Record<string, never>;

interface NodeProps<N extends DocNode> {
  node: N;
}

interface NodesProps<N extends DocNode> {
  nodes: N[];
}

class Node<N extends DocNode> extends Component<NodeProps<N>> {
  store = store.use();
}

class NodeLink extends Node<DocNode> {
  render() {
    const { node } = this.props;
    const { url } = this.store.state as StoreState;
    const searchParams = new URLSearchParams();
    searchParams.set("url", url);
    searchParams.set("kind", node.kind);
    searchParams.set("name", node.name);
    return <a href={`/doc?${searchParams.toString()}`}>{node.name}</a>;
  }
}

class ClassNode extends Node<DocNodeClass> {
  render() {
    const { node } = this.props;
    return (
      <li>
        <h3 class={tw`text-green-600`}>
          <NodeLink node={node} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function Classes({ nodes }: NodesProps<DocNodeClass>) {
  const items = nodes.sort(byName).map((node) => <ClassNode node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Classes</h2>
      <ul>{items}</ul>
    </div>
  );
}

class EnumNode extends Node<DocNodeEnum> {
  render() {
    const { node } = this.props;
    return (
      <li>
        <h3 class={tw`text-green-400`}>
          <NodeLink node={node} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function Enums({ nodes }: NodesProps<DocNodeEnum>) {
  const items = nodes.sort(byName).map((node) => <EnumNode node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Enums</h2>
      <ul>{items}</ul>
    </div>
  );
}

class FnNode extends Node<DocNodeFunction> {
  render() {
    const { node } = this.props;
    return (
      <li>
        <h3 class={tw`text-green-700`}>
          <NodeLink node={node} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function Fns({ nodes }: NodesProps<DocNodeFunction>) {
  const items = nodes.sort(byName).map((node) => <FnNode node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Functions</h2>
      <ul>{items}</ul>
    </div>
  );
}

class InterfaceNode extends Node<DocNodeInterface> {
  render() {
    const { node } = this.props;
    return (
      <li>
        <h3 class={tw`text-green-500`}>
          <NodeLink node={node} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function Interfaces({ nodes }: NodesProps<DocNodeInterface>) {
  const items = nodes.sort(byName).map((node) => <InterfaceNode node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Interfaces</h2>
      <ul>{items}</ul>
    </div>
  );
}

class NamespaceNode extends Node<DocNodeNamespace> {
  render() {
    const { node } = this.props;
    return (
      <li>
        <h3 class={tw`text-yellow-700`}>
          <NodeLink node={node} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function Namespaces({ nodes }: NodesProps<DocNodeNamespace>) {
  const items = nodes.sort(byName).map((node) => <NamespaceNode node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Namespaces</h2>
      <ul>{items}</ul>
    </div>
  );
}

class TypeAliasNode extends Node<DocNodeTypeAlias> {
  render() {
    const { node } = this.props;
    return (
      <li>
        <h3 class={tw`text-yellow-600`}>
          <NodeLink node={node} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function TypeAliases({ nodes }: NodesProps<DocNodeTypeAlias>) {
  const items = nodes.sort(byName).map((node) => <TypeAliasNode node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Type Alias</h2>
      <ul>{items}</ul>
    </div>
  );
}

class VariableNode extends Node<DocNodeVariable> {
  render() {
    const { node } = this.props;
    return (
      <li>
        <h3 class={tw`text-blue-600`}>
          <NodeLink node={node} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function Variables({ nodes }: NodesProps<DocNodeVariable>) {
  const items = nodes.sort(byName).map((node) => <VariableNode node={node} />);
  return (
    <div>
      <h2 class={tw`${section}`}>Variables</h2>
      <ul>{items}</ul>
    </div>
  );
}

function Collection(
  { collection }: { collection: DocNodeCollection },
) {
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

export class DocPrinter extends Component<EmptyProps> {
  store = store.use();

  render() {
    const { entries } = this.store.state as StoreState;
    return <Collection collection={asCollection(entries)} />;
  }
}

interface DocEntryParams {
  name: string;
  kind: DocNodeKind;
}

function ClassEntry({ node }: NodeProps<DocNodeClass>) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{node.name}</h1>
      <div class={tw`${code}`}>
        <span class={tw`text-purple-500 font-semibold`}>class</span> {node.name}
        <TypeParams params={node.classDef.typeParams} />
        {node.classDef.extends && (
          <span>
            {" "}extends {node.classDef.extends}
            <TypeArguments args={node.classDef.superTypeParams} />
          </span>
        )} &#123; &#125;
      </div>
    </div>
  );
}

function EnumEntry({ node }: NodeProps<DocNodeEnum>) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>
        Enum <code>{node.name}</code>
      </h1>
    </div>
  );
}

function FnEntry({ node }: NodeProps<DocNodeFunction>) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>
        Function <code>{node.name}</code>
      </h1>
    </div>
  );
}

function InterfaceExtends({ extensions }: { extensions: TsTypeDef[] }) {
  if (!extensions.length) {
    return;
  }
  const children = [];
  for (let i = 0; i < extensions.length; i++) {
    children.push(<TypeDef def={extensions[i]} />);
    if (i < extensions.length - 1) {
      children.push(<span>,{" "}</span>);
    }
  }
  return <span>{" "}extends {children}</span>;
}

function InterfaceEntry({ node }: NodeProps<DocNodeInterface>) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{node.name}</h1>
      <div class={tw`${code}`}>
        <span class={tw`text-purple-500 font-semibold`}>interface</span>{" "}
        {node.name}
        <TypeParams params={node.interfaceDef.typeParams} />
        <InterfaceExtends extensions={node.interfaceDef.extends} /> &#123;
        <IndexSignatures items={node.interfaceDef.indexSignatures} />
        <CallSignatures items={node.interfaceDef.callSignatures} />
        <Properties items={node.interfaceDef.properties} />
        <Methods items={node.interfaceDef.methods} />
        &#125;
      </div>
      {node.jsDoc && renderMarkdown(node.jsDoc, largeMarkdown)}
    </div>
  );
}

function NamespaceEntry({ node }: NodeProps<DocNodeNamespace>) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>
        Namespace <code>{node.name}</code>
      </h1>
    </div>
  );
}

function TypeParam({ param }: { param: TsTypeParamDef }) {
  return (
    <span>
      <span class={tw`text-blue-400`}>{param.name}</span>
      {param.constraint &&
        (
          <span>
            <span class={tw`text-purple-500 font-semibold`}>
              {" "}extends{" "}
            </span>
            <TypeDef def={param.constraint} />
          </span>
        )}
      {param.default &&
        (
          <span>
            {" "}= <TypeDef def={param.default} />
          </span>
        )}
    </span>
  );
}

function TypeParams({ params }: { params: TsTypeParamDef[] }) {
  if (!params.length) {
    return;
  }
  const children = [];
  for (let i = 0; i < params.length; i++) {
    children.push(<TypeParam param={params[i]} />);
    if (i < params.length - 1) {
      children.push(<span>,{" "}</span>);
    }
  }
  return <span>&lt;{children}&gt;</span>;
}

function TypeArguments({ args }: { args: TsTypeDef[] | undefined }) {
  if (args === undefined || args.length === 0) {
    return;
  }
  const children = [];
  for (let i = 0; i < args.length; i++) {
    children.push(<TypeDef def={args[i]} inline />);
    if (i < args.length - 1) {
      children.push(<span>,{" "}</span>);
    }
  }
  return <span>&lt;{children}&gt;</span>;
}

interface TypeDefProps<T extends TsTypeDef> {
  def: T;
  inline?: boolean;
  terminate?: boolean;
}

function TypeDefArray({ def }: TypeDefProps<TsTypeArrayDef>) {
  return (
    <span>
      <TypeDef def={def.array} inline />[]
    </span>
  );
}

function TypeDefFnOrConstructor(
  { def }: TypeDefProps<TsTypeFnOrConstructorDef>,
) {
  return (
    <span>
      {def.fnOrConstructor.constructor
        ? <span class={tw`text-purple-500 font-bold`}>new{" "}</span>
        : ""}
      <TypeParams params={def.fnOrConstructor.typeParams} />(<Params
        params={def.fnOrConstructor.params}
      />) =&gt; <TypeDef def={def.fnOrConstructor.tsType} />
    </span>
  );
}

function TypeDefKeyword({ def }: TypeDefProps<TsTypeKeywordDef>) {
  return <span class={tw`text-cyan-400 italic`}>{def.keyword}</span>;
}

function TypeDefLiteral({ def }: TypeDefProps<TsTypeDefLiteral>) {
  switch (def.literal.kind) {
    case "bigInt":
      return <span>{def.repr}</span>;
    case "boolean":
      return <span>{def.repr}</span>;
    case "number":
      return <span>{def.repr}</span>;
    case "string":
      return <span class={tw`text-yellow-200`}>"{def.repr}"</span>;
  }
}

function TypeDefOperator({ def }: TypeDefProps<TsTypeTypeOperatorDef>) {
  return (
    <span>
      <span class={tw`text-cyan-400 italic`}>{def.typeOperator.operator}</span>
      {" "}
      <TypeDef def={def.typeOperator.tsType} />
    </span>
  );
}

function TypeDefParenthesized({ def }: TypeDefProps<TsTypeParenthesizedDef>) {
  return (
    <span>
      (<TypeDef def={def.parenthesized} />)
    </span>
  );
}

interface ParamProps<P extends ParamDef> {
  param: P;
}

function ParamIdentifier({ param }: ParamProps<ParamIdentifierDef>) {
  return (
    <span>
      {param.name}
      {param.optional ? "?" : ""}
      {param.tsType && (
        <span>
          : <TypeDef def={param.tsType} inline />
        </span>
      )}
    </span>
  );
}

function Params({ params }: { params: ParamDef[] }) {
  if (!params.length) {
    return;
  }
  const children = [];
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    switch (param.kind) {
      case "identifier":
        children.push(<ParamIdentifier param={param} />);
        break;
      case "array":
      case "assign":
      case "object":
      case "rest":
        children.push(<span>"unsupported"</span>);
    }
    if (i < params.length - 1) {
      children.push(<span>,{" "}</span>);
    }
  }
  return children;
}

function IndexSignatures(
  { items }: {
    items: (LiteralIndexSignatureDef | InterfaceIndexSignatureDef)[];
  },
) {
  return items.map((s) => (
    <div class={tw`ml-4`}>
      {s.readonly
        ? <span class={tw`text-purple-500 font-semibold`}>readonly{" "}</span>
        : undefined}[<Params params={s.params} />]{s.tsType && (
        <span>
          : <TypeDef def={s.tsType} inline />
        </span>
      )};
    </div>
  ));
}

function CallSignatures(
  { items }: { items: (LiteralCallSignatureDef | InterfaceCallSignatureDef)[] },
) {
  return items.map((s) => (
    <div class={tw`ml-4`}>
      <TypeParams params={s.typeParams} />
      (<Params params={s.params} />){s.tsType && (
        <span>
          : <TypeDef def={s.tsType} inline />
        </span>
      )};
    </div>
  ));
}

function Methods(
  { items }: {
    items: (LiteralMethodDef & { optional?: boolean } | InterfaceMethodDef)[];
  },
) {
  return items.map((m) => (
    <div class={tw`ml-4`}>
      {m.name === "new"
        ? <span class={tw`text-purple-500 font-bold`}>new{" "}</span>
        : m.name}
      {m.optional ? "?" : ""}
      <TypeParams params={m.typeParams} />(<Params
        params={m.params}
      />){m.returnType && (
        <span>
          : <TypeDef def={m.returnType} />
        </span>
      )};
    </div>
  ));
}

function Properties(
  { items }: { items: (LiteralPropertyDef | InterfacePropertyDef)[] },
) {
  return items.map((p) => (
    <div class={tw`ml-4`}>
      {p.name}
      {p.optional ? "?" : ""}
      {p.tsType && (
        <span>
          : <TypeDef def={p.tsType} terminate />
        </span>
      )}
    </div>
  ));
}

function TypeDefTypeLiteral({ def }: TypeDefProps<TsTypeTypeLiteralDef>) {
  return (
    <span>
      &#123;
      <IndexSignatures items={def.typeLiteral.indexSignatures} />
      <CallSignatures items={def.typeLiteral.callSignatures} />
      <Properties items={def.typeLiteral.properties} />
      <Methods items={def.typeLiteral.methods} />
      &#125;
    </span>
  );
}

interface TypeDefLinkProps {
  name: string;
  // deno-lint-ignore no-explicit-any
  children?: any;
}

class TypeRefLink extends Component<TypeDefLinkProps> {
  store = store.use();

  render() {
    const { name, children } = this.props;
    const { entries, url } = this.store.state as StoreState;
    const [item, ...path] = name.split(".");
    const anchor = path.join("_");
    const links = entries.filter((e) => e.name === item);
    if (!links.length) {
      return children;
    }
    if (links.length > 1) {
      console.log(links);
    }
    const [link] = links;
    const searchParams = new URLSearchParams();
    if (link.kind === "import") {
      console.log(link);
    }
    searchParams.set("url", link.kind === "import" ? link.importDef.src : url);
    searchParams.set("kind", link.kind);
    searchParams.set("name", link.name);
    return (
      <a
        href={`/doc?${searchParams.toString()}${anchor && `#${anchor}`}`}
        class={tw`underline`}
      >
        {children}
      </a>
    );
  }
}

function TypeDefRef({ def }: TypeDefProps<TsTypeTypeRefDef>) {
  return (
    <span>
      <TypeRefLink name={def.typeRef.typeName}>{def.repr}</TypeRefLink>
      <TypeArguments args={def.typeRef.typeParams} />
    </span>
  );
}

function TypeDefUnion(
  { def: { union }, inline, terminate }: TypeDefProps<TsTypeUnionDef>,
) {
  const children = [];
  if (inline || union.length <= 3) {
    for (let i = 0; i < union.length; i++) {
      children.push(<TypeDef def={union[i]} />);
      if (i < union.length - 1) {
        children.push(<span class={tw`text-purple-500`}>{" "}|{" "}</span>);
      }
    }
    return <span>{children}</span>;
  }
  return (
    <div class={tw`ml-4`}>
      {union.map((def, i, arr) => (
        <div>
          <span class={tw`text-purple-500`}>{" "}|{" "}</span>
          <TypeDef def={def} inline={inline} />
          {terminate && i === arr.length - 1 ? ";" : ""}
        </div>
      ))}
    </div>
  );
}

function TypeDef({ def, inline, terminate }: TypeDefProps<TsTypeDef>) {
  const terminalChar = terminate ? ";" : "";
  switch (def.kind) {
    case "array":
      return (
        <>
          <TypeDefArray def={def} />
          {terminalChar}
        </>
      );
    case "fnOrConstructor":
      return (
        <>
          <TypeDefFnOrConstructor def={def} />
          {terminalChar}
        </>
      );
    case "keyword":
      return (
        <>
          <TypeDefKeyword def={def} />
          {terminalChar}
        </>
      );
    case "literal":
      return (
        <>
          <TypeDefLiteral def={def} />
          {terminalChar}
        </>
      );
    case "parenthesized":
      return (
        <>
          <TypeDefParenthesized def={def} />
          {terminalChar}
        </>
      );
    case "typeLiteral":
      return (
        <>
          <TypeDefTypeLiteral def={def} />
          {terminalChar}
        </>
      );
    case "typeOperator":
      return (
        <>
          <TypeDefOperator def={def} />
          {terminalChar}
        </>
      );
    case "typeRef":
      return (
        <>
          <TypeDefRef def={def} />
          {terminalChar}
        </>
      );
    case "union":
      return <TypeDefUnion def={def} inline={inline} terminate={terminate} />;
    default:
      console.log("kind:", def.kind);
      return <span>{def.repr}</span>;
  }
}

function TypeAliasEntry({ node }: NodeProps<DocNodeTypeAlias>) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{node.name}</h1>
      <div class={tw`${code}`}>
        <span class={tw`text-purple-500 font-semibold`}>type</span> {node.name}
        <TypeParams params={node.typeAliasDef.typeParams} /> ={" "}
        <TypeDef def={node.typeAliasDef.tsType} />
      </div>
      {node.jsDoc && renderMarkdown(node.jsDoc, largeMarkdown)}
    </div>
  );
}

function VariableEntry({ node }: NodeProps<DocNodeVariable>) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{node.name}</h1>
    </div>
  );
}

export class DocEntry extends Component<DocEntryParams> {
  store = store.use();

  render() {
    const { name, kind } = this.props;
    const { entries, url } = this.store.state as StoreState;
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
        return <ClassEntry node={entry} />;
      case "enum":
        return <EnumEntry node={entry} />;
      case "function":
        return <FnEntry node={entry} />;
      case "interface":
        return <InterfaceEntry node={entry} />;
      case "namespace":
        return <NamespaceEntry node={entry} />;
      case "typeAlias":
        return <TypeAliasEntry node={entry} />;
      case "variable":
        return <VariableEntry node={entry} />;
      default:
        return (
          <ErrorMessage title="Not Supported">
            The kind of "{kind}" is currently not supported.
          </ErrorMessage>
        );
    }
  }
}
