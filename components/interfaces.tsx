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
  Location,
  TsTypeDef,
} from "../deps.ts";
import { getState, setState, STYLE_OVERRIDE } from "../shared.ts";
import { take } from "../util.ts";
import type { Child } from "../util.ts";
import {
  Anchor,
  DocWithLink,
  Markdown,
  SectionTitle,
  TocLink,
} from "./common.tsx";
import { Params } from "./params.tsx";
import { codeBlockStyles, gtw, largeMarkdownStyles } from "./styles.ts";
import { TypeDef, TypeParams, TypeParamsDoc } from "./types.tsx";

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

function CallSignaturesDoc(
  { children }: { children: Child<InterfaceCallSignatureDef[]> },
) {
  const signatures = take(children, true);
  if (!signatures.length) {
    return;
  }
  const items = signatures.map((
    { typeParams, params, tsType, jsDoc, location },
    i,
  ) => {
    const id = `call_signature_${i}`;
    return (
      <div class={gtw("docItem")} id={id}>
        <Anchor>{id}</Anchor>
        <div class={gtw("docEntry")}>
          <DocWithLink location={location}>
            <TypeParams>{typeParams}</TypeParams>(<Params inline>
              {params}
            </Params>){tsType && (
              <span>
                : <TypeDef>{tsType}</TypeDef>
              </span>
            )}
          </DocWithLink>
          <Markdown style={largeMarkdownStyles}>{jsDoc}</Markdown>
        </div>
      </div>
    );
  });
  return (
    <div>
      <SectionTitle>Call Signatures</SectionTitle>
      {items}
    </div>
  );
}

function Extends({ children }: { children: Child<TsTypeDef[]> }) {
  const types = take(children, true);
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
      <span class={gtw("keyword", so)}>{" "}extends</span> {items}
    </span>
  );
}

function ExtendsDoc(
  { children, location }: { children: Child<TsTypeDef[]>; location: Location },
) {
  const extensions = take(children, true);
  if (!extensions.length) {
    return;
  }
  const items = extensions.map((ext, i) => {
    const id = `ext_${i}`;
    return (
      <div class={gtw("docItem")} id={id}>
        <Anchor>{id}</Anchor>
        <div class={gtw("docEntry")}>
          <DocWithLink location={location}>
            <TypeDef>{ext}</TypeDef>
          </DocWithLink>
        </div>
      </div>
    );
  });
  return (
    <div>
      <SectionTitle>Extends</SectionTitle>
      {items}
    </div>
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
  const items = signatures.map(({ readonly, params, tsType }, i) => {
    const id = `index_sig_${i}`;
    return (
      <div class={gtw("docItem")} id={id}>
        <Anchor>{id}</Anchor>
        <div class={gtw("docEntry")}>
          {readonly
            ? <span class={gtw("keyword")}>readonly{" "}</span>
            : undefined}[<Params>{params}</Params>]{tsType && (
            <span>
              : <TypeDef inline>{tsType}</TypeDef>
            </span>
          )}
        </div>
      </div>
    );
  });
  return (
    <div>
      <SectionTitle>Index Signatures</SectionTitle>
      {items}
    </div>
  );
}

export function InterfaceCodeBlock(
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
  return methods.map((
    { name, kind, optional, computed, returnType, typeParams, params },
  ) => (
    <div class={gtw("indent", so)}>
      {kind === "getter"
        ? <span class={gtw("keyword", so)}>get{" "}</span>
        : kind === "setter"
        ? <span class={gtw("keyword", so)}>set{" "}</span>
        : undefined}
      {name === "new" ? <span class={gtw("keyword", so)}>{name}{" "}</span>
      : computed
        ? `[${name}]`
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

function MethodsDoc(
  { children }: { children: Child<InterfaceMethodDef[]> },
) {
  const methods = take(children, true);
  if (!methods.length) {
    return;
  }
  const so = getState(STYLE_OVERRIDE);
  const items = methods.map(
    (
      {
        name,
        kind,
        computed,
        optional,
        typeParams,
        params,
        returnType,
        jsDoc,
        location,
      },
    ) => {
      return (
        <div class={gtw("docItem")} id={name}>
          <Anchor>{name}</Anchor>
          <div class={gtw("docEntry")}>
            <DocWithLink location={location}>
              {kind === "getter"
                ? <span class={gtw("keyword", so)}>get{" "}</span>
                : kind === "setter"
                ? <span class={gtw("keyword", so)}>set{" "}</span>
                : undefined}
              {name === "new"
                ? <span class={gtw("keyword", so)}>{name}{" "}</span>
                : computed
                ? `[${name}]`
                : name}
              {optional ? "?" : undefined}
              <TypeParams>{typeParams}</TypeParams>(<Params>
                {params}
              </Params>){returnType && (
                <span>
                  : <TypeDef>{returnType}</TypeDef>
                </span>
              )}
            </DocWithLink>
            <Markdown style={largeMarkdownStyles}>{jsDoc}</Markdown>
          </div>
        </div>
      );
    },
  );
  return (
    <div>
      <SectionTitle>Methods</SectionTitle>
      {items}
    </div>
  );
}

function Properties({ children }: { children: Child<PropertyDef[]> }) {
  const props = take(children, true);
  const so = getState(STYLE_OVERRIDE);
  return props.map(({ name, readonly, computed, optional, tsType }) => (
    <div class={gtw("indent", so)}>
      {readonly
        ? <span class={gtw("keyword", so)}>readonly{" "}</span>
        : undefined}
      {computed ? `[${name}]` : name}
      {optional ? "?" : undefined}
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

function PropertiesDoc(
  { children }: { children: Child<InterfacePropertyDef[]> },
) {
  const props = take(children, true);
  if (!props.length) {
    return;
  }
  const so = getState(STYLE_OVERRIDE);
  const items = props.map(
    ({ name, readonly, computed, optional, tsType, jsDoc, location }) => {
      return (
        <div class={gtw("docItem")} id={name}>
          <Anchor>{name}</Anchor>
          <div class={gtw("docEntry")}>
            <DocWithLink location={location}>
              {readonly
                ? <span class={gtw("keyword", so)}>readonly{" "}</span>
                : undefined}
              {computed ? `[${name}]` : name}
              {optional ? "?" : undefined}
              {tsType
                ? (
                  <span>
                    : <TypeDef inline>{tsType}</TypeDef>
                  </span>
                )
                : ""}
            </DocWithLink>
            <Markdown style={largeMarkdownStyles}>{jsDoc}</Markdown>
          </div>
        </div>
      );
    },
  );
  return (
    <div>
      <SectionTitle>Properties</SectionTitle>
      {items}
    </div>
  );
}

export function InterfaceDoc(
  { children }: { children: Child<DocNodeInterface> },
) {
  const {
    location,
    interfaceDef: {
      typeParams,
      extends: ext,
      indexSignatures,
      callSignatures,
      properties,
      methods,
    },
  } = take(children);
  return (
    <div class={gtw("docItems")}>
      <TypeParamsDoc location={location}>{typeParams}</TypeParamsDoc>
      <ExtendsDoc location={location}>{ext}</ExtendsDoc>
      <IndexSignaturesDoc>{indexSignatures}</IndexSignaturesDoc>
      <CallSignaturesDoc>{callSignatures}</CallSignaturesDoc>
      <PropertiesDoc>{properties}</PropertiesDoc>
      <MethodsDoc>{methods}</MethodsDoc>
    </div>
  );
}

export function InterfaceToc(
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
  return (
    <div>
      <h3 class={tw`text-gray-900 mt-3 mb-1 text-xl font-bold`}>{name}</h3>
      <ul>
        {typeParams.length ? <TocLink>Type Parameters</TocLink> : undefined}
        {ext.length ? <TocLink>Extends</TocLink> : undefined}
        {indexSignatures.length
          ? <TocLink>Index Signatures</TocLink>
          : undefined}
        {callSignatures.length ? <TocLink>Call Signatures</TocLink> : undefined}
        {properties.length ? <TocLink>Properties</TocLink> : undefined}
        {methods.length ? <TocLink>Methods</TocLink> : undefined}
      </ul>
    </div>
  );
}
