/** @jsx h */
import { h } from "../deps.ts";
import type { DocNodeVariable } from "../deps.ts";
import { getState, setState, STYLE_OVERRIDE } from "../shared.ts";
import { DocTitle, Markdown } from "./common.tsx";
import type { DocProps } from "./common.tsx";
import { codeBlockStyles, gtw, largeMarkdownStyles } from "./styles.ts";
import { TypeDef } from "./types.tsx";
import { take } from "../util.ts";
import type { Child } from "../util.ts";

function VariableCodeBlock({ children }: { children: Child<DocNodeVariable> }) {
  const {
    name,
    variableDef: { kind, tsType },
  } = take(children);
  const prev = getState(STYLE_OVERRIDE);
  setState(STYLE_OVERRIDE, codeBlockStyles);
  const keyword = gtw("keyword", codeBlockStyles);
  const codeBlock = (
    <div class={gtw("code")}>
      <span class={keyword}>{kind}</span> {name}
      {tsType
        ? (
          <span>
            : <TypeDef terminate>{tsType}</TypeDef>
          </span>
        )
        : ";"}
    </div>
  );
  setState(STYLE_OVERRIDE, prev);
  return codeBlock;
}

export function VariableDoc({ children, path }: DocProps<DocNodeVariable>) {
  const node = take(children);
  const { jsDoc } = node;
  return (
    <div class={gtw("mainBox")}>
      <DocTitle path={path}>{node}</DocTitle>
      <Markdown style={largeMarkdownStyles}>{jsDoc}</Markdown>
      <VariableCodeBlock>{node}</VariableCodeBlock>
      <div class={gtw("docItems")}></div>
    </div>
  );
}
