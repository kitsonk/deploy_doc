/** @jsx h */
import { h, tw } from "../deps.ts";
import type { DocNodeEnum } from "../deps.ts";
import {
  byName,
  code,
  entryTitle,
  getName,
  largeMarkdown,
  Markdown,
  Node,
  NodeLink,
  Section,
} from "./common.tsx";
import type { NodeProps, NodesProps } from "./common.tsx";
import { getStyle } from "./styles.ts";

class EnumNode extends Node<DocNodeEnum> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-green-400 mx-2`}>
          <NodeLink node={node} path={path} />
        </h3>
        <Markdown jsDoc={node.jsDoc} />
      </li>
    );
  }
}

export function Enums({ nodes, path }: NodesProps<DocNodeEnum>) {
  const items = nodes.sort(byName).map((node) => (
    <EnumNode node={node} path={path} />
  ));
  return (
    <div>
      <Section>Enums</Section>
      <ul>{items}</ul>
    </div>
  );
}

export function EnumEntry({ node, path }: NodeProps<DocNodeEnum>) {
  const members = node.enumDef.members.map((item) => <div>{item.name},</div>);
  return (
    <div class={tw`${getStyle("mainBox")}`}>
      <h1 class={tw`${entryTitle}`}>{getName(node, path)}</h1>
      <Markdown jsDoc={node.jsDoc} style={largeMarkdown} />
      <div class={tw`${code}`}>
        <span class={tw`${getStyle("keyword")}`}>enum</span> {node.name} &#123;
        {" "}
        {members.length ? <div class={tw`ml-4`}>{members}</div> : undefined}
        {" "}
        &#125;
      </div>
    </div>
  );
}
