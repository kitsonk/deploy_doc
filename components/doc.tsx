/** @jsx h */
/** @jsxFrag Fragment */
import {
  apply,
  Component,
  Fragment,
  h,
  htmlEntities,
  rustyMarkdown,
  tw,
} from "../deps.ts";
import type {
  Accessibility,
  ClassConstructorDef,
  ClassIndexSignatureDef,
  ClassMethodDef,
  ClassPropertyDef,
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
import { assert } from "../util.ts";

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

const section = apply`text-2xl border-b border-gray-400 py-2 mt-1 mb-3`;
const code = apply`font-mono p-2 bg-gray-900 rounded text-white`;
const keyword = apply`text-purple-500 font-medium`;
const entryTitle = apply`text-3xl border-b border-gray-800 py-2 mt-2 mb-4`;
const mainBox = apply`w-full bg-gray-200 rounded-lg px-8 pt-4 pb-8`;
const smallMarkdown = apply`ml-4 mr-2 py-2 text-sm`;
const largeMarkdown = apply`mt-4 mb-8 flex flex-col space-y-4`;

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
  path?: string[];
}

interface NodesProps<N extends DocNode> {
  nodes: N[];
  path?: string[];
}

class Node<N extends DocNode> extends Component<NodeProps<N>> {
  store = store.use();
}

class NodeLink extends Node<DocNode> {
  render() {
    const { node, path } = this.props;
    const { url } = this.store.state as StoreState;
    const href = `/${url.replace("://", "/")}${url.endsWith("/") ? "" : "/"}~/${
      [...path ?? [], node.name].join(".")
    }`;
    return <a href={href}>{node.name}</a>;
  }
}

class ClassNode extends Node<DocNodeClass> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-green-600`}>
          <NodeLink node={node} path={path} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function Classes({ nodes, path }: NodesProps<DocNodeClass>) {
  const items = nodes.sort(byName).map((node) =>
    <ClassNode node={node} path={path} />
  );
  return (
    <div>
      <h2 class={tw`${section}`}>Classes</h2>
      <ul>{items}</ul>
    </div>
  );
}

class EnumNode extends Node<DocNodeEnum> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-green-400`}>
          <NodeLink node={node} path={path} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function Enums({ nodes, path }: NodesProps<DocNodeEnum>) {
  const items = nodes.sort(byName).map((node) =>
    <EnumNode node={node} path={path} />
  );
  return (
    <div>
      <h2 class={tw`${section}`}>Enums</h2>
      <ul>{items}</ul>
    </div>
  );
}

class FnNode extends Node<DocNodeFunction> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-green-700`}>
          <NodeLink node={node} path={path} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function Fns({ nodes, path }: NodesProps<DocNodeFunction>) {
  const items = nodes.sort(byName).map((node) =>
    <FnNode node={node} path={path} />
  );
  return (
    <div>
      <h2 class={tw`${section}`}>Functions</h2>
      <ul>{items}</ul>
    </div>
  );
}

class InterfaceNode extends Node<DocNodeInterface> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-green-500`}>
          <NodeLink node={node} path={path} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function Interfaces({ nodes, path }: NodesProps<DocNodeInterface>) {
  const items = nodes.sort(byName).map((node) =>
    <InterfaceNode node={node} path={path} />
  );
  return (
    <div>
      <h2 class={tw`${section}`}>Interfaces</h2>
      <ul>{items}</ul>
    </div>
  );
}

class NamespaceNode extends Node<DocNodeNamespace> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-yellow-700`}>
          <NodeLink node={node} path={path} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function Namespaces({ nodes, path }: NodesProps<DocNodeNamespace>) {
  const items = nodes.sort(byName).map((node) =>
    <NamespaceNode node={node} path={path} />
  );
  return (
    <div>
      <h2 class={tw`${section}`}>Namespaces</h2>
      <ul>{items}</ul>
    </div>
  );
}

class TypeAliasNode extends Node<DocNodeTypeAlias> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-yellow-600`}>
          <NodeLink node={node} path={path} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function TypeAliases({ nodes, path }: NodesProps<DocNodeTypeAlias>) {
  const items = nodes.sort(byName).map((node) =>
    <TypeAliasNode node={node} path={path} />
  );
  return (
    <div>
      <h2 class={tw`${section}`}>Type Alias</h2>
      <ul>{items}</ul>
    </div>
  );
}

class VariableNode extends Node<DocNodeVariable> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-blue-600`}>
          <NodeLink node={node} path={path} />
        </h3>
        {node.jsDoc && renderMarkdown(node.jsDoc)}
      </li>
    );
  }
}

function Variables({ nodes, path }: NodesProps<DocNodeVariable>) {
  const items = nodes.sort(byName).map((node) =>
    <VariableNode node={node} path={path} />
  );
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
  item: string;
}

function AccessibilityNode({ value }: { value?: Accessibility }) {
  return value ? <span class={tw`${keyword}`}>{value}</span> : undefined;
}

function Constructors({ items }: { items: ClassConstructorDef[] }) {
  if (!items || items.length === 0) {
    return;
  }
  const children = items.map((c) => (
    <div>
      <AccessibilityNode value={c.accessibility} />
      <span class={tw`${keyword}`}>{c.name}</span>
      (<Params params={c.params} />);
    </div>
  ));
  return <div class={tw`ml-4`}>{children}</div>;
}

function Implements({ types }: { types: TsTypeDef[] }) {
  if (!types.length) {
    return;
  }
  const children = [];
  for (let i = 0; i < types.length; i++) {
    children.push(<TypeDef def={types[i]} />);
    if (i < types.length - 1) {
      children.push(<span>,{" "}</span>);
    }
  }
  return <span>{" "}implements {children}</span>;
}

function isClassMethod(
  value: ClassPropertyDef | ClassMethodDef,
): value is ClassMethodDef & { kind: "method" } {
  return "kind" in value && value.kind === "method";
}

function isClassAccessor(
  value: ClassPropertyDef | ClassMethodDef,
): value is ClassMethodDef & { kind: "getter" | "setter" } {
  return "kind" in value &&
    (value.kind === "getter" || value.kind === "setter");
}

function isClassProperty(
  value: ClassPropertyDef | ClassMethodDef,
): value is ClassPropertyDef {
  return "readonly" in value;
}

function compareAccessibility(
  a: ClassPropertyDef | ClassMethodDef,
  b: ClassPropertyDef | ClassMethodDef,
): number {
  if (a.accessibility !== b.accessibility) {
    if (a.accessibility === "private") {
      return -1;
    }
    if (b.accessibility === "private") {
      return 1;
    }
    if (a.accessibility === "protected") {
      return -1;
    }
    if (b.accessibility === "protected") {
      return 1;
    }
  }
  if (a.name === b.name && isClassAccessor(a) && isClassAccessor(b)) {
    return a.kind === "getter" ? -1 : 1;
  }
  if (a.name.startsWith("[") && b.name.startsWith("[")) {
    return a.name.localeCompare(b.name);
  }
  if (a.name.startsWith("[")) {
    return 1;
  }
  if (b.name.startsWith("[")) {
    return -1;
  }
  return a.name.localeCompare(b.name);
}

function getName(node: DocNode, path?: string[]): string {
  return path ? [...path, node.name].join(".") : node.name;
}

function ClassEntry({ node, path }: NodeProps<DocNodeClass>) {
  const items = [...node.classDef.properties, ...node.classDef.methods].sort(
    (a, b) => {
      if (a.isStatic !== b.isStatic) {
        return a.isStatic ? 1 : -1;
      }
      if (
        (isClassProperty(a) && isClassProperty(b)) ||
        (isClassProperty(a) && isClassAccessor(b)) ||
        (isClassAccessor(a) && isClassProperty(b)) ||
        (isClassMethod(a) && isClassMethod(b))
      ) {
        return compareAccessibility(a, b);
      }
      if (isClassAccessor(a) && !isClassAccessor(b)) {
        return -1;
      }
      if (isClassAccessor(b)) {
        return 1;
      }
      return isClassProperty(a) ? -1 : 1;
    },
  );
  const hasElements = !!(node.classDef.constructors.length ||
    node.classDef.indexSignatures.length || items.length);
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{getName(node, path)}</h1>
      {node.jsDoc && renderMarkdown(node.jsDoc, largeMarkdown)}
      <div class={tw`${code}`}>
        <span class={tw`${keyword}`}>
          {node.classDef.isAbstract ? "abstract " : ""}class
        </span>{" "}
        {node.name}
        <TypeParams params={node.classDef.typeParams} />
        {node.classDef.extends && (
          <span>
            {" "}extends {node.classDef.extends}
            <TypeArguments args={node.classDef.superTypeParams} />
          </span>
        )}
        <Implements types={node.classDef.implements} /> &#123;
        {hasElements
          ? (
            <div class={tw`flex flex-col space-y-4`}>
              <Constructors items={node.classDef.constructors} />
              <IndexSignatures items={node.classDef.indexSignatures} />
              <ClassItems items={items} />
            </div>
          )
          : " "}
        &#125;
      </div>
    </div>
  );
}

function ClassProperty({ item }: { item: ClassPropertyDef }) {
  return (
    <div>
      {item.isStatic || item.accessibility || item.isAbstract || item.readonly
        ? (
          <span class={tw`${keyword}`}>
            {item.isStatic ? "static " : undefined}
            {item.accessibility && `${item.accessibility} `}
            {item.isAbstract ? "abstract " : ""}
            {item.readonly ? "readonly " : ""}
          </span>
        )
        : undefined}
      <span>{item.name}</span>
      {item.optional ? "?" : ""}
      {item.tsType
        ? (
          <span>
            : <TypeDef def={item.tsType} terminate />
          </span>
        )
        : ";"}
    </div>
  );
}

function ClassMethod({ item }: { item: ClassMethodDef }) {
  return (
    <div>
      {item.isStatic || item.accessibility || item.isAbstract
        ? (
          <span class={tw`${keyword}`}>
            {item.isStatic ? "static " : undefined}
            {item.accessibility && `${item.accessibility} `}
            {item.isAbstract ? "abstract " : ""}
          </span>
        )
        : undefined}
      {item.functionDef.isAsync || item.functionDef.isGenerator ||
          item.kind === "getter" || item.kind === "setter"
        ? (
          <span class={tw`${keyword}`}>
            {item.functionDef.isAsync ? "async " : ""}
            {item.kind === "getter"
              ? "get "
              : item.kind === "setter"
              ? "set "
              : undefined}
            {item.functionDef.isGenerator ? "*" : ""}
          </span>
        )
        : undefined}
      <span
        class={item.kind === "method" && !item.name.startsWith("[")
          ? tw`text-green-500`
          : undefined}
      >
        {item.name}
      </span>
      {item.optional ? "?" : ""}
      <TypeParams params={item.functionDef.typeParams} />(<Params
        params={item.functionDef.params}
      />){item.functionDef.returnType && (
        <span>
          : <TypeDef def={item.functionDef.returnType} inline />
        </span>
      )};
    </div>
  );
}

function getClassItemType(
  item: ClassPropertyDef | ClassMethodDef,
): "prop" | "method" | "static prop" | "static method" {
  if (item.isStatic) {
    return isClassProperty(item) || isClassAccessor(item)
      ? "static prop"
      : "static method";
  } else {
    return isClassProperty(item) || isClassAccessor(item) ? "prop" : "method";
  }
}

function ClassItems(
  { items }: { items: (ClassMethodDef | ClassPropertyDef)[] },
) {
  if (!items.length) {
    return;
  }
  const children = [];
  let prev: "prop" | "method" | "static prop" | "static method" | undefined;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const curr = getClassItemType(item);
    if (prev && prev !== curr) {
      children.push(<div>&nbsp;</div>);
    }
    prev = curr;
    if (isClassMethod(item) || isClassAccessor(item)) {
      children.push(<ClassMethod item={item} />);
    } else {
      assert(isClassProperty(item));
      children.push(<ClassProperty item={item} />);
    }
  }
  return <div class={tw`ml-4`}>{children}</div>;
}

function EnumEntry({ node, path }: NodeProps<DocNodeEnum>) {
  const members = node.enumDef.members.map((item) => <div>{item.name},</div>);
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{getName(node, path)}</h1>
      {node.jsDoc && renderMarkdown(node.jsDoc, largeMarkdown)}
      <div class={tw`${code}`}>
        <span class={tw`${keyword}`}>enum</span> {node.name} &#123;{" "}
        {members.length ? <div class={tw`ml-4`}>{members}</div> : undefined}
        {" "}
        &#125;
      </div>
    </div>
  );
}

function FnEntry({ node, path }: NodeProps<DocNodeFunction>) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{getName(node, path)}</h1>
      {node.jsDoc && renderMarkdown(node.jsDoc, largeMarkdown)}
      <div class={tw`${code}`}>
        <span class={tw`${keyword}`}>
          {node.functionDef.isAsync
            ? "async "
            : ""}function{node.functionDef.isGenerator ? "* " : " "}
        </span>
        <span class={tw`text-green-500`}>{node.name}</span>
        <TypeParams params={node.functionDef.typeParams} />(<Params
          params={node.functionDef.params}
        />){node.functionDef.returnType && (
          <span>
            : <TypeDef def={node.functionDef.returnType} />
          </span>
        )};
      </div>
    </div>
  );
}

function InterfaceExtends({ types }: { types: TsTypeDef[] }) {
  if (!types.length) {
    return;
  }
  const children = [];
  for (let i = 0; i < types.length; i++) {
    children.push(<TypeDef def={types[i]} />);
    if (i < types.length - 1) {
      children.push(<span>,{" "}</span>);
    }
  }
  return <span>{" "}extends {children}</span>;
}

function InterfaceEntry({ node, path }: NodeProps<DocNodeInterface>) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{getName(node, path)}</h1>
      {node.jsDoc && renderMarkdown(node.jsDoc, largeMarkdown)}
      <div class={tw`${code}`}>
        <span class={tw`${keyword}`}>interface</span> {node.name}
        <TypeParams params={node.interfaceDef.typeParams} />
        <InterfaceExtends types={node.interfaceDef.extends} /> &#123;
        <IndexSignatures items={node.interfaceDef.indexSignatures} />
        <CallSignatures items={node.interfaceDef.callSignatures} />
        <Properties items={node.interfaceDef.properties} />
        <Methods items={node.interfaceDef.methods} />
        &#125;
      </div>
    </div>
  );
}

function NamespaceEntry({ node, path = [] }: NodeProps<DocNodeNamespace>) {
  const collection = asCollection(node.namespaceDef.elements);
  const currentPath = [...path, node.name];
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{getName(node, path)}</h1>
      {node.jsDoc && renderMarkdown(node.jsDoc, largeMarkdown)}
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

function TypeParam({ param }: { param: TsTypeParamDef }) {
  return (
    <span>
      <span class={tw`text-blue-400`}>{param.name}</span>
      {param.constraint &&
        (
          <span>
            <span class={tw`${keyword}`}>
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

function TypeArguments({ args }: { args: TsTypeDef[] | undefined | null }) {
  if (args == null || args.length === 0) {
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

function TypeDefConditional(
  { def: { conditionalType } }: TypeDefProps<TsTypeConditionalDef>,
) {
  return (
    <span>
      <TypeDef def={conditionalType.checkType} />{" "}
      <span class={tw`${keyword}`}>extends</span>{" "}
      <TypeDef def={conditionalType.extendsType} /> ?{" "}
      <TypeDef def={conditionalType.trueType} /> :{" "}
      <TypeDef def={conditionalType.falseType} />
    </span>
  );
}

function TypeDefFnOrConstructor(
  { def }: TypeDefProps<TsTypeFnOrConstructorDef>,
) {
  return (
    <span>
      {def.fnOrConstructor.constructor
        ? <span class={tw`${keyword}`}>new{" "}</span>
        : ""}
      <TypeParams params={def.fnOrConstructor.typeParams} />(<Params
        params={def.fnOrConstructor.params}
      />) =&gt; <TypeDef def={def.fnOrConstructor.tsType} />
    </span>
  );
}

function TypeDefKeyword({ def: { keyword } }: TypeDefProps<TsTypeKeywordDef>) {
  return <span class={tw`text-cyan-400 italic`}>{keyword}</span>;
}

function TypeDefLiteral({ def }: TypeDefProps<TsTypeDefLiteral>) {
  switch (def.literal.kind) {
    case "bigInt":
      return <span class={tw`text-indigo-500`}>{def.repr}</span>;
    case "boolean":
      return <span class={tw`text-cyan-500`}>{def.repr}</span>;
    case "number":
      return <span class={tw`text-indigo-500`}>{def.repr}</span>;
    case "string":
      return <span class={tw`text-yellow-200`}>"{def.repr}"</span>;
  }
}

function TypeDefOperator(
  { def: { typeOperator } }: TypeDefProps<TsTypeTypeOperatorDef>,
) {
  return (
    <span>
      <span class={tw`text-cyan-400 italic`}>{typeOperator.operator}</span>{" "}
      <TypeDef def={typeOperator.tsType} />
    </span>
  );
}

function TypeDefOptional(
  { def: { optional }, inline }: TypeDefProps<TsTypeOptionalDef>,
) {
  return (
    <span>
      <TypeDef def={optional} inline={inline} />?
    </span>
  );
}

function TypeDefParenthesized(
  { def, inline }: TypeDefProps<TsTypeParenthesizedDef>,
) {
  return (
    <span>
      (<TypeDef def={def.parenthesized} inline={inline} />)
    </span>
  );
}

function TypeDefPredicate(
  { def: { typePredicate } }: TypeDefProps<TsTypeTypePredicateDef>,
) {
  return (
    <span>
      {typePredicate.asserts
        ? <span class={tw`${keyword}`}>asserts{" "}</span>
        : undefined}
      {typePredicate.param.type === "this" ? "this" : typePredicate.param.name}
      {typePredicate.type && (
        <span>
          {" is "}
          <TypeDef def={typePredicate.type} />
        </span>
      )}
    </span>
  );
}

function TypeDefQuery({ def }: TypeDefProps<TsTypeQueryDef>) {
  return <span>{def.typeQuery}</span>;
}

function TypeDefRest({ def, inline }: TypeDefProps<TsTypeRestDef>) {
  return (
    <span>
      ...<TypeDef def={def.rest} inline={inline} />
    </span>
  );
}

interface ParamProps<P extends ParamDef> {
  index?: string;
  item: P;
  optional?: boolean;
}

function ParamArray({ item, optional, index }: ParamProps<ParamArrayDef>) {
  return (
    <span>
      [{item.elements.map((e, i) =>
        e && <Param item={e} index={`${index}${i}`} />
      )}]{item.optional || optional ? "?" : ""}
      {item.tsType && (
        <span>
          : <TypeDef def={item.tsType} inline />
        </span>
      )}
    </span>
  );
}

function ParamAssign({ item, index }: ParamProps<ParamAssignDef>) {
  return (
    <span>
      <Param item={item.left} optional index={index} />
      {item.tsType &&
        <TypeDef def={item.tsType} inline />}
    </span>
  );
}

function ParamIdentifier({ item, optional }: ParamProps<ParamIdentifierDef>) {
  return (
    <span>
      {item.name}
      {item.optional || optional ? "?" : ""}
      {item.tsType && (
        <span>
          : <TypeDef def={item.tsType} inline />
        </span>
      )}
    </span>
  );
}

function ParamObject({ item, optional, index }: ParamProps<ParamObjectDef>) {
  return (
    <span>
      {`param${index}`}
      {item.optional || optional ? "?" : ""}
      {item.tsType && (
        <span>
          : <TypeDef def={item.tsType} inline />
        </span>
      )}
    </span>
  );
}

function ParamRest({ item, index }: ParamProps<ParamRestDef>) {
  return (
    <span>
      ...<Param item={item.arg} index={index} />
      {item.tsType && (
        <span>
          : <TypeDef def={item.tsType} inline />
        </span>
      )}
    </span>
  );
}

function Param({ item, optional, index }: ParamProps<ParamDef>) {
  switch (item.kind) {
    case "array":
      return <ParamArray item={item} optional={optional} index={index} />;
    case "assign":
      return <ParamAssign item={item} index={index} />;
    case "identifier":
      return <ParamIdentifier item={item} optional={optional} index={index} />;
    case "object":
      return <ParamObject item={item} optional={optional} index={index} />;
    case "rest":
      return <ParamRest item={item} index={index} />;
  }
}

function Params({ params, inline }: { params: ParamDef[]; inline?: boolean }) {
  if (!params.length) {
    return;
  }

  if (params.length < 3 || inline) {
    const children = [];
    for (let i = 0; i < params.length; i++) {
      children.push(<Param item={params[i]} index={String(i)} />);
      if (i < params.length - 1) {
        children.push(<span>,{" "}</span>);
      }
    }
    return children;
  }
  return params.map((p, i) => (
    <div class={tw`ml-4`}>
      <Param item={p} index={String(i)} />
    </div>
  ));
}

function IndexSignatures(
  { items }: {
    items: (
      | LiteralIndexSignatureDef
      | InterfaceIndexSignatureDef
      | ClassIndexSignatureDef
    )[];
  },
) {
  if (!items.length) {
    return;
  }
  const children = items.map((s) => (
    <div>
      {s.readonly
        ? <span class={tw`${keyword}`}>readonly{" "}</span>
        : undefined}[<Params params={s.params} />]{s.tsType && (
        <span>
          : <TypeDef def={s.tsType} inline />
        </span>
      )};
    </div>
  ));
  return <div class={tw`ml-4`}>{children}</div>;
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
      {m.name === "new" ? <span class={tw`${keyword}`}>new{" "}</span> : m.name}
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
      {p.tsType
        ? (
          <span>
            : <TypeDef def={p.tsType} terminate />
          </span>
        )
        : ";"}
    </div>
  ));
}

function TypeDefIndexedAccess({ def }: TypeDefProps<TsTypeIndexedAccessDef>) {
  return (
    <span>
      <TypeDef def={def.indexedAccess.objType} inline />[<TypeDef
        def={def.indexedAccess.indexType}
        inline
      />]
    </span>
  );
}

function TypeDefIntersection(
  { def: { intersection }, inline, terminate }: TypeDefProps<
    TsTypeIntersectionDef
  >,
) {
  if (inline || intersection.length <= 3) {
    const children = [];
    for (let i = 0; i < intersection.length; i++) {
      children.push(<TypeDef def={intersection[i]} />);
      if (i < intersection.length - 1) {
        children.push(<span class={tw`text-purple-500`}>{" "}&amp;{" "}</span>);
      }
    }
    if (terminate) {
      children.push(";");
    }
    return <span>{children}</span>;
  }
  return (
    <div class={tw`ml-4`}>
      {intersection.map((def, i, arr) => (
        <div>
          <span class={tw`text-purple-500`}>{" "}&amp;{" "}</span>
          <TypeDef def={def} inline={inline} />
          {terminate && i === arr.length - 1 ? ";" : ""}
        </div>
      ))}
    </div>
  );
}

function TypeDefTuple(
  { def: { tuple }, inline }: TypeDefProps<TsTypeTupleDef>,
) {
  if (inline || tuple.length <= 3) {
    const children = [];
    for (let i = 0; i < tuple.length; i++) {
      children.push(<TypeDef def={tuple[i]} />);
      if (i < tuple.length - 1) {
        children.push(", ");
      }
    }
    return <span>[{children}]</span>;
  }
  return (
    <div class={tw`ml-4`}>
      [{tuple.map((def) => (
        <div>
          <TypeDef def={def} inline={inline} />,{" "}
        </div>
      ))}]
    </div>
  );
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
    const ref = (link.kind === "import" ? link.importDef.src : url)
      .replace("://", "/");
    const href = `/${ref}${
      ref.endsWith("/") ? "" : "/"
    }~/${link.name}${anchor && `#${anchor}`}`;
    return <a href={href} class={tw`underline`}>{children}</a>;
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
  if (inline || union.length <= 3) {
    const children = [];
    for (let i = 0; i < union.length; i++) {
      children.push(<TypeDef def={union[i]} />);
      if (i < union.length - 1) {
        children.push(<span class={tw`text-purple-500`}>{" "}|{" "}</span>);
      }
    }
    if (terminate) {
      children.push(";");
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
    case "conditional":
      return (
        <>
          <TypeDefConditional def={def} />
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
    case "indexedAccess":
      return (
        <>
          <TypeDefIndexedAccess def={def} />
          {terminalChar}
        </>
      );
    case "intersection":
      return (
        <TypeDefIntersection def={def} inline={inline} terminate={terminate} />
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
    case "optional":
      return (
        <>
          <TypeDefOptional def={def} />
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
    case "rest":
      return (
        <>
          <TypeDefRest def={def} />
          {terminalChar}
        </>
      );
    case "this":
      return (
        <>
          <span class={tw`text-cyan-400 italic`}>{def.repr}</span>;
        </>
      );
    case "tuple":
      return (
        <>
          <TypeDefTuple def={def} inline={inline} />
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
    case "typePredicate":
      return (
        <>
          <TypeDefPredicate def={def} />
          {terminalChar}
        </>
      );
    case "typeQuery":
      return (
        <>
          <TypeDefQuery def={def} />
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
      // deno-lint-ignore no-explicit-any
      return <span>{htmlEntities.encode((def as any).repr)}</span>;
  }
}

function TypeAliasEntry({ node, path }: NodeProps<DocNodeTypeAlias>) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{getName(node, path)}</h1>
      {node.jsDoc && renderMarkdown(node.jsDoc, largeMarkdown)}
      <div class={tw`${code}`}>
        <span class={tw`${keyword}`}>type</span> {node.name}
        <TypeParams params={node.typeAliasDef.typeParams} /> ={" "}
        <TypeDef def={node.typeAliasDef.tsType} terminate />
      </div>
    </div>
  );
}

function VariableEntry({ node, path }: NodeProps<DocNodeVariable>) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{getName(node, path)}</h1>
      {node.jsDoc && renderMarkdown(node.jsDoc, largeMarkdown)}
      <div class={tw`${code}`}>
        <span class={tw`${keyword}`}>
          {`${node.variableDef.kind} `}
        </span>
        <span>{node.name}</span>
        {node.variableDef.tsType
          ? (
            <span>
              : <TypeDef def={node.variableDef.tsType} />
            </span>
          )
          : undefined};
      </div>
    </div>
  );
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
