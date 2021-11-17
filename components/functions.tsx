/** @jsx h */
import { h, tw } from "../deps.ts";
import type { DocNodeFunction } from "../deps.ts";
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
import type { NodesProps } from "./common.tsx";
import { Params } from "./params.tsx";
import { getStyle } from "./styles.ts";
import { TypeDef, TypeParams } from "./types.tsx";

class FnNode extends Node<DocNodeFunction> {
  render() {
    const { node, path } = this.props;
    return (
      <li>
        <h3 class={tw`text-green-700 mx-2`}>
          <NodeLink node={node} path={path} />
        </h3>
        <Markdown jsDoc={node.jsDoc} />
      </li>
    );
  }
}

export function Fns({ nodes, path }: NodesProps<DocNodeFunction>) {
  const flattened = new Map<string, DocNodeFunction>();
  for (const node of nodes) {
    const item = flattened.get(node.name);
    if (item && node.jsDoc && !item.jsDoc) {
      item.jsDoc = node.jsDoc;
    } else if (!item) {
      flattened.set(node.name, node);
    }
  }
  const items = [...flattened.values()].sort(byName).map((node) => (
    <FnNode node={node} path={path} />
  ));
  return (
    <div>
      <Section>Functions</Section>
      <ul>{items}</ul>
    </div>
  );
}

export interface FnEntryProps {
  nodes: DocNodeFunction[];
  path?: string[];
}

export function FnEntry({ nodes, path }: FnEntryProps) {
  let jsDoc;
  for (const node of nodes) {
    if (!jsDoc && node.jsDoc) {
      jsDoc = node.jsDoc;
      break;
    }
  }
  const fns = nodes.map((node) => (
    <div>
      <span class={tw`${getStyle("keyword")}`}>
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
  ));

  return (
    <div class={tw`${getStyle("mainBox")}`}>
      <h1 class={tw`${entryTitle}`}>{getName(nodes[0], path)}</h1>
      <Markdown jsDoc={jsDoc} style={largeMarkdown} />
      <div class={tw`${code}`}>{fns}</div>
    </div>
  );
}
