/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, htmlEntities } from "../deps.ts";
import type {
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
import { getState, store, STYLE_OVERRIDE } from "../shared.ts";
import type { StoreState } from "../shared.ts";
import { take } from "../util.ts";
import { Params } from "./params.tsx";
import { gtw } from "./styles.ts";

interface TypeDefProps<Def extends TsTypeDef = TsTypeDef> {
  children: Def | Def[];
  inline?: boolean;
  terminate?: boolean;
}

export function TypeArguments(
  { children }: {
    children: (TsTypeDef[] | undefined) | (TsTypeDef[] | undefined)[];
  },
) {
  const args = take<TsTypeDef[] | undefined>(children, true);
  if (!args || !args.length || !args[0]) {
    return;
  }
  const items = [];
  for (let i = 0; i < args.length; i++) {
    items.push(<TypeDef inline>{args[i]}</TypeDef>);
    if (i < args.length - 1) {
      items.push(<span>,{" "}</span>);
    }
  }
  return <span>&lt;{items}&gt;</span>;
}

export function TypeDef({ children, ...props }: TypeDefProps) {
  const def = take(children);
  const terminalChar = props.terminate ? ";" : "";
  switch (def.kind) {
    case "array":
      return (
        <>
          <TypeDefArray {...props}>{def}</TypeDefArray>
          {terminalChar}
        </>
      );
    case "conditional":
      return (
        <>
          <TypeDefConditional>{def}</TypeDefConditional>
          {terminalChar}
        </>
      );
    case "fnOrConstructor":
      return (
        <>
          <TypeDefFnOrConstructor {...props}>{def}</TypeDefFnOrConstructor>
          {terminalChar}
        </>
      );
    case "importType":
      return <span>TODO</span>;
    case "indexedAccess":
      return (
        <>
          <TypeDefIndexedAccess>{def}</TypeDefIndexedAccess>
          {terminalChar}
        </>
      );
    case "infer":
      return <span>TODO</span>;
    case "intersection":
      return <TypeDefIntersection {...props}>{def}</TypeDefIntersection>;
    case "keyword":
      return (
        <>
          <TypeDefKeyword>{def}</TypeDefKeyword>
          {terminalChar}
        </>
      );
    case "literal":
      return (
        <>
          <TypeDefLiteral>{def}</TypeDefLiteral>
          {terminalChar}
        </>
      );
    case "mapped":
      return <span>TODO</span>;
    case "optional":
      return (
        <>
          <TypeDefOptional>{def}</TypeDefOptional>
          {terminalChar}
        </>
      );
    case "parenthesized":
      return (
        <>
          <TypeDefParenthesized>{def}</TypeDefParenthesized>
          {terminalChar}
        </>
      );
    case "rest":
      return (
        <>
          <TypeDefRest>{def}</TypeDefRest>
          {terminalChar}
        </>
      );
    case "this":
      return (
        <>
          <TypeDefThis />
          {terminalChar}
        </>
      );
    case "tuple":
      return (
        <>
          <TypeDefTuple {...props}>{def}</TypeDefTuple>
          {terminalChar}
        </>
      );
    case "typeLiteral":
      return (
        <>
          <TypeDefTypeLiteral>{def}</TypeDefTypeLiteral>
          {terminalChar}
        </>
      );
    case "typeOperator":
      return (
        <>
          <TypeDefOperator>{def}</TypeDefOperator>
          {terminalChar}
        </>
      );
    case "typePredicate":
      return (
        <>
          <TypeDefPredicate>{def}</TypeDefPredicate>
          {terminalChar}
        </>
      );
    case "typeQuery":
      return (
        <>
          <TypeDefQuery>{def}</TypeDefQuery>
          {terminalChar}
        </>
      );
    case "typeRef":
      return (
        <>
          <TypeDefRef>{def}</TypeDefRef>
          {terminalChar}
        </>
      );
    case "union":
      return <TypeDefUnion {...props}>{def}</TypeDefUnion>;
    default:
      // deno-lint-ignore no-explicit-any
      return <span>{htmlEntities.encode((def as any).repr)}</span>;
  }
}

function TypeDefArray({ children }: TypeDefProps<TsTypeArrayDef>) {
  const { array } = take(children);
  return (
    <span>
      <TypeDef inline>{array}</TypeDef>[]
    </span>
  );
}

function TypeDefConditional({ children }: TypeDefProps<TsTypeConditionalDef>) {
  const { conditionalType: { checkType, extendsType, trueType, falseType } } =
    take(children);
  const so = getState(STYLE_OVERRIDE);
  return (
    <span>
      <TypeDef>{checkType}</TypeDef>{" "}
      <span class={gtw("keyword", so)}>extends</span>{" "}
      <TypeDef>{extendsType}</TypeDef> ? <TypeDef>{trueType}</TypeDef> :{" "}
      <TypeDef>{falseType}</TypeDef>
    </span>
  );
}

function TypeDefFnOrConstructor(
  { children, inline }: TypeDefProps<TsTypeFnOrConstructorDef>,
) {
  const { fnOrConstructor: { constructor, typeParams, params, tsType } } = take(
    children,
  );
  const so = getState(STYLE_OVERRIDE);
  return (
    <span>
      {constructor ? <span class={gtw("keyword", so)}>new{" "}</span> : ""}
      <TypeParams>{typeParams}</TypeParams>(<Params inline={inline}>
        {params}
      </Params>) =&gt; <TypeDef inline={inline}>{tsType}</TypeDef>
    </span>
  );
}

function TypeDefIndexedAccess(
  { children }: TypeDefProps<TsTypeIndexedAccessDef>,
) {
  const { indexedAccess: { objType, indexType } } = take(children);
  return (
    <span>
      <TypeDef inline>{objType}</TypeDef>[<TypeDef inline>{indexType}</TypeDef>]
    </span>
  );
}

function TypeDefIntersection(
  { children, inline, terminate }: TypeDefProps<TsTypeIntersectionDef>,
) {
  const { intersection } = take(children);
  const so = getState(STYLE_OVERRIDE);
  const keyword = gtw("keyword", so);
  const lastIndex = intersection.length - 1;
  if (inline || intersection.length <= 3) {
    const defs = [];
    for (let i = 0; i < intersection.length; i++) {
      defs.push(<TypeDef>{intersection[i]}</TypeDef>);
      if (i < lastIndex) {
        defs.push(<span class={keyword}>{" "}&amp;{" "}</span>);
      }
    }
    if (terminate) {
      defs.push(";");
    }
    return <span>{defs}</span>;
  }
  return (
    <div class={gtw("indent", so)}>
      {intersection.map((def, i) => (
        <div>
          <span class={keyword}>{" "}&amp;{" "}</span>
          <TypeDef inline={inline}>{def}</TypeDef>
          {terminate && i === lastIndex ? ";" : ""}
        </div>
      ))}
    </div>
  );
}

function TypeDefKeyword({ children }: TypeDefProps<TsTypeKeywordDef>) {
  const { keyword } = take(children);
  const so = getState(STYLE_OVERRIDE);
  return <span class={gtw("typeKeyword", so)}>{keyword}</span>;
}

function TypeDefLiteral({ children }: TypeDefProps<TsTypeDefLiteral>) {
  const { literal: { kind }, repr } = take(children);
  const so = getState(STYLE_OVERRIDE);
  switch (kind) {
    case "bigInt":
      return <span class={gtw("numberLiteral", so)}>{repr}</span>;
    case "boolean":
      return <span class={gtw("boolean", so)}>{repr}</span>;
    case "number":
      return <span class={gtw("numberLiteral", so)}>{repr}</span>;
    case "string":
      return <span class={gtw("stringLiteral", so)}>"{repr}"</span>;
    case "template":
      // TODO(@kitsonk) do this properly
      return <span class={gtw("stringLiteral", so)}>`{repr}`</span>;
  }
}

function TypeDefOperator({ children }: TypeDefProps<TsTypeTypeOperatorDef>) {
  const { typeOperator: { operator, tsType } } = take(children);
  const so = getState(STYLE_OVERRIDE);
  return (
    <span>
      <span class={gtw("typeKeyword", so)}>{operator}</span>
      <TypeDef>{tsType}</TypeDef>
    </span>
  );
}

function TypeDefOptional(
  { children, inline }: TypeDefProps<TsTypeOptionalDef>,
) {
  const { optional } = take(children);
  return (
    <span>
      <TypeDef inline={inline}>{optional}</TypeDef>
    </span>
  );
}

function TypeDefParenthesized(
  { children, inline }: TypeDefProps<TsTypeParenthesizedDef>,
) {
  const { parenthesized } = take(children);
  return (
    <span>
      (<TypeDef inline={inline}>{parenthesized}</TypeDef>)
    </span>
  );
}

function TypeDefPredicate({ children }: TypeDefProps<TsTypeTypePredicateDef>) {
  const { typePredicate: { asserts, param, type } } = take(children);
  const so = getState(STYLE_OVERRIDE);
  return (
    <span>
      {asserts
        ? <span class={gtw("keyword", so)}>asserts{" "}</span>
        : undefined}
      {param.type === "this" ? <span class={gtw("typeKeyword", so)}>this</span>
      : param.name}
      {type && (
        <span>
          {" is "}
          <TypeDef>{type}</TypeDef>
        </span>
      )}
    </span>
  );
}

function TypeDefQuery({ children }: TypeDefProps<TsTypeQueryDef>) {
  const { typeQuery } = take(children);
  return <span>{typeQuery}</span>;
}

function TypeDefRef({ children }: TypeDefProps<TsTypeTypeRefDef>) {
  const { typeRef: { typeName, typeParams } } = take(children);
  return (
    <span>
      <TypeRefLink>{typeName}</TypeRefLink>
      <TypeArguments>{typeParams}</TypeArguments>
    </span>
  );
}

function TypeDefRest({ children, inline }: TypeDefProps<TsTypeRestDef>) {
  const { rest } = take(children);
  return (
    <span>
      ...<TypeDef inline={inline}>{rest}</TypeDef>
    </span>
  );
}

function TypeDefThis() {
  const so = getState(STYLE_OVERRIDE);
  return <span class={gtw("typeKeyword", so)}>this</span>;
}

function TypeDefTuple({ children, inline }: TypeDefProps<TsTypeTupleDef>) {
  const { tuple } = take(children);
  if (inline || tuple.length <= 3) {
    const items = [];
    for (let i = 0; i < tuple.length; i++) {
      items.push(<TypeDef inline={inline}>{tuple[i]}</TypeDef>);
      if (i < tuple.length - 1) {
        items.push(", ");
      }
    }
    return <span>[{items}]</span>;
  }
  const so = getState(STYLE_OVERRIDE);
  return (
    <div class={gtw("indent", so)}>
      [{tuple.map((def) => (
        <div>
          <TypeDef inline={inline}>{def}</TypeDef>,{" "}
        </div>
      ))}]
    </div>
  );
}

function TypeDefTypeLiteral({ children }: TypeDefProps<TsTypeTypeLiteralDef>) {
  return (
    <span>
      &#123;
      {/* todo */}
      &#125;
    </span>
  );
}

function TypeDefUnion(
  { children, inline, terminate }: TypeDefProps<TsTypeUnionDef>,
) {
  const { union } = take(children);
  const so = getState(STYLE_OVERRIDE);
  const keyword = gtw("keyword", so);
  const lastIndex = union.length - 1;
  if (inline || union.length <= 3) {
    const defs = [];
    for (let i = 0; i < union.length; i++) {
      defs.push(<TypeDef>{union[i]}</TypeDef>);
      if (i < lastIndex) {
        defs.push(<span class={keyword}>{" "}|{" "}</span>);
      }
    }
    if (terminate) {
      defs.push(";");
    }
    return <span>{defs}</span>;
  }
  return (
    <div class={gtw("indent", so)}>
      {union.map((def, i) => (
        <div>
          <span class={keyword}>{" "}&amp;{" "}</span>
          <TypeDef inline={inline}>{def}</TypeDef>
          {terminate && i === lastIndex ? ";" : ""}
        </div>
      ))}
    </div>
  );
}

function TypeRefLink({ children }: { children: string | string[] }) {
  const name = take(children);
  const { entries, url } = store.state as StoreState;
  const [item, ...path] = name.split(".");
  const anchor = path.join("_");
  const links = entries.filter((e) => e.name === item);
  if (!links.length) {
    return name;
  }
  const [link] = links;
  const ref = (link.kind === "import" ? link.importDef.src : url).replace(
    "://",
    "/",
  );
  const href = `/${ref}${ref.endsWith("/") ? "" : "/"}~/${link.name}${
    anchor && `#${anchor}`
  }`;
  const so = getState(STYLE_OVERRIDE);
  return <a href={href} class={gtw("typeLink", so)}>{name}</a>;
}

function TypeParam(
  { children }: { children: TsTypeParamDef | TsTypeParamDef[] },
) {
  const param = take(children);
  const so = getState(STYLE_OVERRIDE);
  const keyword = gtw("keyword", so);
  return (
    <span>
      <span class={gtw("typeParam", so)}>{param.name}</span>
      {param.constraint && (
        <span>
          <span class={keyword}>{" "}extends{" "}</span>
          <TypeDef>{param.constraint}</TypeDef>
        </span>
      )}
      {param.default && (
        <span>
          <span class={keyword}>{" "}={" "}</span>
          <TypeDef>{param.default}</TypeDef>
        </span>
      )}
    </span>
  );
}

export function TypeParams(
  { children }: { children: TsTypeParamDef[] | TsTypeParamDef[][] },
) {
  const params = take<TsTypeParamDef[]>(children, true);
  if (!params.length) {
    return;
  }
  const items = [];
  for (let i = 0; i < params.length; i++) {
    items.push(<TypeParam>{params[i]}</TypeParam>);
    if (i < params.length - 1) {
      items.push(<span>,{" "}</span>);
    }
  }
  return <span>&lt;{items}&gt;</span>;
}
