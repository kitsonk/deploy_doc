/** @jsx h */
import { h } from "../deps.ts";
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
import { getState, setState, STYLE_OVERRIDE } from "../shared.ts";
import { take } from "../util.ts";
import type { Child } from "../util.ts";
import { DocTitle, Markdown, SectionTitle } from "./common.tsx";
import type { DocProps } from "./common.tsx";
import { Params } from "./params.tsx";
import { codeBlockStyles, gtw, largeMarkdownStyles } from "./styles.ts";
import { TypeDef, TypeParams } from "./types.tsx";

type CallSignatureDef = LiteralCallSignatureDef | InterfaceCallSignatureDef;
type IndexSignatureDef =
  | ClassIndexSignatureDef
  | InterfaceIndexSignatureDef
  | LiteralIndexSignatureDef;
type MethodDef = LiteralMethodDef | InterfaceMethodDef;
type PropertyDef = LiteralPropertyDef | InterfacePropertyDef;

function CallSignatures({ children }: { children: Child<CallSignatureDef[]> }) {
  const items = take(children, true);
  const so = getState(STYLE_OVERRIDE);
  return items.map(({ typeParams, params, tsType }) => (
    <div class={gtw("indent", so)}>
      <TypeParams>{typeParams}</TypeParams>(<Params>{params}</Params>){tsType &&
        (
          <span>
            : <TypeDef inline>{tsType}</TypeDef>
          </span>
        )}
    </div>
  ));
}

function Extends({ children }: { children: Child<TsTypeDef[]> }) {
  const types = take(children);
  const so = getState(STYLE_OVERRIDE);
  if (!types.length) {
    return;
  }
  const items = [];
  for (let i = 0; i < types.length; i++) {
    items.push(<TypeDef>{types[i]}</TypeDef>);
    if (i < types.length - 1) {
      items.push(<span>,{" "}</span>);
    }
  }
  return (
    <span>
      <span class={gtw("keyword", so)}>{" "}extends</span> {children}
    </span>
  );
}

export function IndexSignatures(
  { children }: { children: Child<IndexSignatureDef[]> },
) {
  const signatures = take(children, true);
  if (!signatures.length) {
    return;
  }
  const so = getState(STYLE_OVERRIDE);
  const items = signatures.map(({ params, readonly, tsType }) => (
    <div>
      {readonly
        ? <span class={gtw("keyword", so)}>readonly{" "}</span>
        : undefined}[<Params>{params}</Params>]{tsType && (
        <span>
          : <TypeDef inline>{tsType}</TypeDef>
        </span>
      )};
    </div>
  ));
  return <div class={gtw("indent", so)}>{items}</div>;
}

export function IndexSignaturesDoc(
  { children }: { children: Child<IndexSignatureDef[]> },
) {
  const signatures = take(children, true);
  if (!signatures.length) {
    return;
  }
  const items = signatures.map(({ readonly, params, tsType }) => (
    <div>
      {readonly
        ? <span class={gtw("keyword")}>readonly{" "}</span>
        : undefined}[<Params>{params}</Params>]{tsType && (
        <span>
          : <TypeDef inline>{tsType}</TypeDef>
        </span>
      )}
    </div>
  ));
  return (
    <div>
      <SectionTitle>Index Signatures</SectionTitle>
      {items}
    </div>
  );
}

function InterfaceCodeBlock(
  { children }: { children: Child<DocNodeInterface> },
) {
  const {
    name,
    interfaceDef: {
      typeParams,
      extends: ext,
      indexSignatures,
      callSignatures,
      properties,
      methods,
    },
  } = take(children);
  const prev = getState(STYLE_OVERRIDE);
  setState(STYLE_OVERRIDE, codeBlockStyles);
  const keyword = gtw("keyword", codeBlockStyles);
  const codeBlock = (
    <div class={gtw("code")}>
      <span class={keyword}>interface</span> {name}{" "}
      <TypeParams>{typeParams}</TypeParams>
      <Extends>{ext}</Extends> &#123;
      <IndexSignatures>{indexSignatures}</IndexSignatures>
      <CallSignatures>{callSignatures}</CallSignatures>
      <Properties>{properties}</Properties>
      <Methods>{methods}</Methods>
      &#125;
    </div>
  );
  setState(STYLE_OVERRIDE, prev);
  return codeBlock;
}

function Methods({ children }: { children: Child<MethodDef[]> }) {
  const methods = take(children, true);
  const so = getState(STYLE_OVERRIDE);
  return methods.map(({ name, optional, returnType, typeParams, params }) => (
    <div class={gtw("indent", so)}>
      {name === "new"
        ? <span class={gtw("keyword", so)}>{name}{" "}</span>
        : name}
      {optional ? "?" : undefined}
      <TypeParams>{typeParams}</TypeParams>(<Params>
        {params}
      </Params>){returnType && (
        <span>
          : <TypeDef>{returnType}</TypeDef>
        </span>
      )}
    </div>
  ));
}

function Properties({ children }: { children: Child<PropertyDef[]> }) {
  const props = take(children, true);
  const so = getState(STYLE_OVERRIDE);
  return props.map(({ name, optional, tsType }) => (
    <div class={gtw("indent", so)}>
      {name}
      {optional
        ? "?"
        : undefined}
      {tsType
        ? (
          <span>
            : <TypeDef terminate>{tsType}</TypeDef>
          </span>
        )
        : ";"}
    </div>
  ));
}

export function InterfaceDoc({ children, path }: DocProps<DocNodeInterface>) {
  const node = take(children);
  const { jsDoc } = node;
  return (
    <div class={gtw("mainBox")}>
      <DocTitle path={path}>{node}</DocTitle>
      <Markdown style={largeMarkdownStyles}>{jsDoc}</Markdown>
      <InterfaceCodeBlock>{node}</InterfaceCodeBlock>
      <div class={gtw("docItems")}></div>
    </div>
  );
}
