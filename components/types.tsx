/** @jsx h */
/** @jsxFrag Fragment */
import { Component, Fragment, h, htmlEntities, tw } from "../deps.ts";
import type {
  CSSRules,
  Directive,
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
import { store } from "../shared.ts";
import { StoreState } from "../shared.ts";
import { keyword } from "./common.tsx";
import {
  CallSignatures,
  IndexSignatures,
  Methods,
  Properties,
} from "./interfaces.tsx";
import { Params } from "./params.tsx";

interface TypeDefProps<T extends TsTypeDef> {
  def: T;
  inline?: boolean;
  terminate?: boolean;
  styles?: Record<string, Directive<CSSRules>>;
}

const coloredStyles = {
  keyword,
};

export const plainStyles = {};

export function TypeArguments(
  { args }: { args: TsTypeDef[] | undefined | null },
) {
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

function TypeDefArray({ def }: TypeDefProps<TsTypeArrayDef>) {
  return (
    <span>
      <TypeDef def={def.array} inline />[]
    </span>
  );
}

function TypeDefConditional(
  { def: { conditionalType }, styles = coloredStyles }: TypeDefProps<
    TsTypeConditionalDef
  >,
) {
  return (
    <span>
      <TypeDef def={conditionalType.checkType} />{" "}
      <span class={tw`${styles.keyword}`}>extends</span>{" "}
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

function TypeDefRef({ def }: TypeDefProps<TsTypeTypeRefDef>) {
  return (
    <span>
      <TypeRefLink name={def.typeRef.typeName}>
        {def.typeRef.typeName}
      </TypeRefLink>
      <TypeArguments args={def.typeRef.typeParams} />
    </span>
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

export function TypeDef({ def, inline, terminate }: TypeDefProps<TsTypeDef>) {
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

export function TypeParams({ params }: { params: TsTypeParamDef[] }) {
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
