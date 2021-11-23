/** @jsx h */
import { h } from "../deps.ts";
import type { DocNodeFunction } from "../deps.ts";
import { getState, setState, STYLE_OVERRIDE } from "../shared.ts";
import { DocTitle } from "./common.tsx";
import { Params } from "./params.tsx";
import { codeBlockStyles, gtw } from "./styles.ts";
import { TypeDef, TypeParams } from "./types.tsx";
import { take } from "../util.ts";
import type { Child } from "../util.ts";

function FnCodeBlock({ children }: { children: Child<DocNodeFunction[]> }) {
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

export function FnDoc(
  { children, path }: { children: Child<DocNodeFunction[]>; path?: string[] },
) {
  const nodes = take(children);
  return (
    <div class={gtw("mainBox")}>
      <DocTitle path={path}>{nodes[0]}</DocTitle>
      <FnCodeBlock>{nodes}</FnCodeBlock>
      <div class={gtw("docItems")}></div>
    </div>
  );
}
