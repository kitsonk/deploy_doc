/** @jsx h */
import { h } from "../deps.ts";
import type { DocNodeEnum } from "../deps.ts";
import { getState, setState, STYLE_OVERRIDE } from "../shared.ts";
import { DocTitle, Markdown } from "./common.tsx";
import type { DocProps } from "./common.tsx";
import { codeBlockStyles, gtw, largeMarkdownStyles } from "./styles.ts";
import { take } from "../util.ts";
import type { Child } from "../util.ts";

function EnumCodeBlock({ children }: { children: Child<DocNodeEnum> }) {
  const {
    name,
    enumDef: { members },
  } = take(children);
  const prev = getState(STYLE_OVERRIDE);
  setState(STYLE_OVERRIDE, codeBlockStyles);
  const keyword = gtw("keyword", codeBlockStyles);
  const items = members.map(({ name }) => <div>{name},</div>);
  const codeBlock = (
    <div class={gtw("code")}>
      <span class={keyword}>enum</span> {name} &#123; {items.length
        ? <div class={gtw("indent", codeBlockStyles)}>{items}</div>
        : undefined} &#125;
    </div>
  );
  setState(STYLE_OVERRIDE, prev);
  return codeBlock;
}

export function EnumDoc({ children, path }: DocProps<DocNodeEnum>) {
  const node = take(children);
  const { jsDoc } = node;
  return (
    <div class={gtw("mainBox")}>
      <DocTitle path={path}>{node}</DocTitle>
      <Markdown style={largeMarkdownStyles}>{jsDoc}</Markdown>
      <EnumCodeBlock>{node}</EnumCodeBlock>
      <div class={gtw("docItems")}></div>
    </div>
  );
}
