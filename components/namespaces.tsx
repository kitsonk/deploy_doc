/** @jsx h */
import { h, tw } from "../deps.ts";
import type { DocNodeNamespace } from "../deps.ts";
import { store } from "../shared.ts";
import type { StoreState } from "../shared.ts";
import { take } from "../util.ts";
import type { Child } from "../util.ts";
import {
  asCollection,
  DocTitle,
  Markdown,
  Section,
  TocLink,
} from "./common.tsx";
import type { DocProps } from "./common.tsx";
import { gtw, largeMarkdownStyles } from "./styles.ts";

export function NamespaceDoc(
  { children, path = [] }: DocProps<DocNodeNamespace>,
) {
  const node = take(children);
  const { name, jsDoc, namespaceDef: { elements } } = node;
  const { includePrivate } = store.state as StoreState;
  const collection = asCollection(elements, includePrivate);
  const currentPath = [...path, name];
  return (
    <article class={gtw("mainBox")}>
      <DocTitle path={path}>{node}</DocTitle>
      <Markdown style={largeMarkdownStyles}>{jsDoc}</Markdown>
      {collection.namespace && (
        <Section title="Namespace" style="nodeNamespace" path={currentPath}>
          {collection.namespace}
        </Section>
      )}
      {collection.class && (
        <Section title="Classes" style="nodeClass" path={currentPath}>
          {collection.class}
        </Section>
      )}
      {collection.enum && (
        <Section title="Enums" style="nodeEnum" path={currentPath}>
          {collection.enum}
        </Section>
      )}
      {collection.variable && (
        <Section title="Variables" style="nodeVariable" path={currentPath}>
          {collection.variable}
        </Section>
      )}
      {collection.function && (
        <Section title="Functions" style="nodeFunction" path={currentPath}>
          {collection.function}
        </Section>
      )}
      {collection.interface && (
        <Section title="Interfaces" style="nodeInterface" path={currentPath}>
          {collection.interface}
        </Section>
      )}
      {collection.typeAlias && (
        <Section title="Types" style="nodeTypeAlias" path={currentPath}>
          {collection.typeAlias}
        </Section>
      )}
    </article>
  );
}

export function NamespaceToc(
  { children }: { children: Child<DocNodeNamespace> },
) {
  const { namespaceDef: { elements } } = take(children);
  const { includePrivate } = store.state as StoreState;
  const collection = asCollection(elements, includePrivate);
  return (
    <div>
      <h3 class={tw`text-gray-900 mt-3 mb-1 text-xl font-bold`}>
        This Namespace
      </h3>
      <ul>
        {collection.namespace && <TocLink>Namespaces</TocLink>}
        {collection.class && <TocLink>Classes</TocLink>}
        {collection.enum && <TocLink>Enums</TocLink>}
        {collection.variable && <TocLink>Variables</TocLink>}
        {collection.function && <TocLink>Functions</TocLink>}
        {collection.interface && <TocLink>Interfaces</TocLink>}
        {collection.typeAlias && <TocLink>Types</TocLink>}
      </ul>
    </div>
  );
}
