/** @jsx h */
import { h, tw } from "../deps.ts";
import type {
  ClassIndexSignatureDef,
  DocNodeInterface,
  InterfaceCallSignatureDef,
  InterfaceIndexSignatureDef,
  InterfaceMethodDef,
  InterfacePropertyDef,
  LiteralCallSignatureDef,
  LiteralIndexSignatureDef,
  LiteralMethodDef,
  LiteralPropertyDef,
  TsTypeDef,
} from "../deps.ts";
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
  Section,
} from "./common.tsx";
import type { NodeProps, NodesProps } from "./common.tsx";
import { Params } from "./params.tsx";
import { TypeDef, TypeParams } from "./types.tsx";

export function CallSignatures(
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

export function IndexSignatures(
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

export function IndexSignaturesDoc(
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
        ? <span class={tw`font-bold`}>readonly{" "}</span>
        : undefined}[<Params params={s.params} />]{s.tsType && (
        <span>
          : <TypeDef def={s.tsType} inline />
        </span>
      )};
    </div>
  ));
  return (
    <div>
      <Section>Index Signatures</Section>
      {children}
    </div>
  );
}

export function InterfaceEntry({ node, path }: NodeProps<DocNodeInterface>) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{getName(node, path)}</h1>
      <Markdown jsDoc={node.jsDoc} style={largeMarkdown} />
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

class InterfaceNode extends Node<DocNodeInterface> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-green-500 mx-2`}>
          <NodeLink node={node} path={path} />
        </h3>
        <Markdown jsDoc={node.jsDoc} />
      </li>
    );
  }
}

export function Interfaces({ nodes, path }: NodesProps<DocNodeInterface>) {
  const items = nodes.sort(byName).map((node) => (
    <InterfaceNode node={node} path={path} />
  ));
  return (
    <div>
      <Section>Interfaces</Section>
      <ul>{items}</ul>
    </div>
  );
}

export function Methods(
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

export function Properties(
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
