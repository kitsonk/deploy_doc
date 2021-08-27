/** @jsx h */
import { h, tw } from "../deps.ts";
import type {
  Accessibility,
  ClassConstructorDef,
  ClassMethodDef,
  ClassPropertyDef,
  DocNodeClass,
  TsTypeDef,
} from "../deps.ts";
import { assert } from "../util.ts";
import {
  byName,
  code,
  entryTitle,
  getName,
  keyword,
  largeMarkdown,
  mainBox,
  Markdown,
  Node,
  NodeLink,
  section,
} from "./common.tsx";
import type { NodeProps, NodesProps } from "./common.tsx";
import { Params } from "./params.tsx";
import { IndexSignatures } from "./interfaces.tsx";
import { TypeArguments, TypeDef, TypeParams } from "./types.tsx";

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

class ClassNode extends Node<DocNodeClass> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-green-600`}>
          <NodeLink node={node} path={path} />
        </h3>
        <Markdown jsDoc={node.jsDoc} />
      </li>
    );
  }
}

export function Classes({ nodes, path }: NodesProps<DocNodeClass>) {
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

export function ClassEntry({ node, path }: NodeProps<DocNodeClass>) {
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
      <Markdown jsDoc={node.jsDoc} style={largeMarkdown} />
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
