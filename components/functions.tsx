/** @jsx h */
import { h } from "../deps.ts";
import type { DocNodeFunction } from "../deps.ts";
import { getState, setState, STYLE_OVERRIDE } from "../shared.ts";
import { Anchor, DocWithLink, Markdown, TARGET_RE } from "./common.tsx";
import { Params } from "./params.tsx";
import { codeBlockStyles, gtw, largeMarkdownStyles } from "./styles.ts";
import { TypeDef, TypeParams } from "./types.tsx";
import { take } from "../util.ts";
import type { Child } from "../util.ts";

export function FnCodeBlock(
  { children }: { children: Child<DocNodeFunction[]> },
) {
  const fns = take(children);
  const prev = getState(STYLE_OVERRIDE);
  setState(STYLE_OVERRIDE, codeBlockStyles);
  const keyword = gtw("keyword", codeBlockStyles);
  const fnName = gtw("fnName", codeBlockStyles);
  const items = fns.map((
    {
      name,
      functionDef: { isAsync, isGenerator, typeParams, params, returnType },
    },
  ) => (
    <div>
      <span class={keyword}>
        {isAsync ? "async " : undefined}function{isGenerator ? "* " : " "}
      </span>
      <span class={fnName}>{name}</span>
      <TypeParams>{typeParams}</TypeParams>(<Params>
        {params}
      </Params>){returnType && (
        <span>
          : <TypeDef>{returnType}</TypeDef>
        </span>
      )};
    </div>
  ));
  const codeBlock = <div class={gtw("code")}>{items}</div>;
  setState(STYLE_OVERRIDE, prev);
  return codeBlock;
}

function SubSectionTitle(
  { children, id }: { children: Child<string>; id: string },
) {
  const name = take(children);
  const target = `${name.replaceAll(TARGET_RE, "_")}_${id}`;
  return (
    <h3 class={gtw("subSection")} id={target}>
      <Anchor>{target}</Anchor>
      {name}
    </h3>
  );
}

export function FnDoc(
  { children }: { children: Child<DocNodeFunction[]> },
) {
  const fns = take(children);
  const isSingle = fns.length === 1;
  const items = fns.map(
    (
      {
        location,
        name,
        jsDoc,
        functionDef: { typeParams, params, returnType },
      },
      i,
    ) => {
      const id = i.toString();
      return (
        <div class={gtw("docItem")} id={id}>
          <Anchor>{id}</Anchor>
          <div class={gtw("docEntry")}>
            <DocWithLink location={location}>
              {name}
              <TypeParams>{typeParams}</TypeParams>(<Params inline>
                {params}
              </Params>)
              {returnType && (
                <span>
                  : <TypeDef>{returnType}</TypeDef>
                </span>
              )}
            </DocWithLink>
            {!isSingle
              ? <Markdown style={largeMarkdownStyles}>{jsDoc}</Markdown>
              : undefined}
          </div>
          {typeParams.length
            ? (
              <div>
                <SubSectionTitle id={id}>Type Parameters</SubSectionTitle>
              </div>
            )
            : undefined}
          {params.length
            ? (
              <div>
                <SubSectionTitle id={id}>Parameters</SubSectionTitle>
              </div>
            )
            : undefined}
          {returnType && (
            <div>
              <SubSectionTitle id={id}>Return Type</SubSectionTitle>
            </div>
          )}
        </div>
      );
    },
  );
  return <div class={gtw("docItems")}>{items}</div>;
}

export function FnToc({ children }: { children: Child<DocNodeFunction[]> }) {
  return;
}
