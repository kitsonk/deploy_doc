/** @jsx h */
import { h, tw } from "../deps.ts";
import type { DocNodeTypeAlias } from "../deps.ts";
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
import { TypeDef, TypeParams } from "./types.tsx";

class TypeAliasNode extends Node<DocNodeTypeAlias> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-yellow-600 mx-2`}>
          <NodeLink node={node} path={path} />
        </h3>
        <Markdown jsDoc={node.jsDoc} />
      </li>
    );
  }
}

export function TypeAliases({ nodes, path }: NodesProps<DocNodeTypeAlias>) {
  const items = nodes.sort(byName).map((node) => (
    <TypeAliasNode node={node} path={path} />
  ));
  return (
    <div>
      <Section>Type Aliases</Section>
      <ul>{items}</ul>
    </div>
  );
}

export function TypeAliasEntry({ node, path }: NodeProps<DocNodeTypeAlias>) {
  return (
    <div class={tw`${getStyle("mainBox")}`}>
      <h1 class={tw`${entryTitle}`}>{getName(node, path)}</h1>
      <Markdown jsDoc={node.jsDoc} style={largeMarkdown} />
      <div class={tw`${code}`}>
        <span class={tw`${getStyle("keyword")}`}>type</span> {node.name}
        <TypeParams params={node.typeAliasDef.typeParams} /> ={" "}
        <TypeDef def={node.typeAliasDef.tsType} terminate />
      </div>
    </div>
  );
}
