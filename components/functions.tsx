/** @jsx h */
import { h, tw } from "../deps.ts";
import type { DocNodeFunction } from "../deps.ts";
import {
  byName,
  code,
  entryTitle,
  getName,
  keyword,
  largeMarkdown,
  mainBox,
  Markdown,
  Node,
  NodeLink,
  section,
} from "./common.tsx";
import type { NodeProps, NodesProps } from "./common.tsx";
import { Params } from "./params.tsx";
import { TypeDef, TypeParams } from "./types.tsx";

class FnNode extends Node<DocNodeFunction> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-green-700`}>
          <NodeLink node={node} path={path} />
        </h3>
        <Markdown jsDoc={node.jsDoc} />
      </li>
    );
  }
}

export function Fns({ nodes, path }: NodesProps<DocNodeFunction>) {
  const items = nodes.sort(byName).map((node) =>
    <FnNode node={node} path={path} />
  );
  return (
    <div>
      <h2 class={tw`${section}`}>Functions</h2>
      <ul>{items}</ul>
    </div>
  );
}

export function FnEntry({ node, path }: NodeProps<DocNodeFunction>) {
  return (
    <div class={tw`${mainBox}`}>
      <h1 class={tw`${entryTitle}`}>{getName(node, path)}</h1>
      <Markdown jsDoc={node.jsDoc} style={largeMarkdown} />
      <div class={tw`${code}`}>
        <span class={tw`${keyword}`}>
          {node.functionDef.isAsync
            ? "async "
            : ""}function{node.functionDef.isGenerator ? "* " : " "}
        </span>
        <span class={tw`text-green-500`}>{node.name}</span>
        <TypeParams params={node.functionDef.typeParams} />(<Params
          params={node.functionDef.params}
        />){node.functionDef.returnType && (
          <span>
            : <TypeDef def={node.functionDef.returnType} />
          </span>
        )};
      </div>
    </div>
  );
}
