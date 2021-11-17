/** @jsx h */
import { h, tw } from "../deps.ts";
import type { DocNodeVariable } from "../deps.ts";
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
import { TypeDef } from "./types.tsx";

class VariableNode extends Node<DocNodeVariable> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-blue-600 mx-2`}>
          <NodeLink node={node} path={path} />
        </h3>
        <Markdown jsDoc={node.jsDoc} />
      </li>
    );
  }
}

export function Variables({ nodes, path }: NodesProps<DocNodeVariable>) {
  const items = nodes.sort(byName).map((node) => (
    <VariableNode node={node} path={path} />
  ));
  return (
    <div>
      <Section>Variables</Section>
      <ul>{items}</ul>
    </div>
  );
}

export function VariableEntry({ node, path }: NodeProps<DocNodeVariable>) {
  return (
    <div class={tw`${getStyle("mainBox")}`}>
      <h1 class={tw`${entryTitle}`}>{getName(node, path)}</h1>
      <Markdown jsDoc={node.jsDoc} style={largeMarkdown} />
      <div class={tw`${code}`}>
        <span class={tw`${getStyle("keyword")}`}>
          {`${node.variableDef.kind} `}
        </span>
        <span>{node.name}</span>
        {node.variableDef.tsType
          ? (
            <span>
              : <TypeDef def={node.variableDef.tsType} />
            </span>
          )
          : undefined};
      </div>
    </div>
  );
}
