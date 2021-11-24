/** @jsx h */
import { h } from "../deps.ts";
import type { DocNodeNamespace } from "../deps.ts";
import { take } from "../util.ts";
import { asCollection, DocTitle, Markdown, Section } from "./common.tsx";
import type { DocProps } from "./common.tsx";
import { gtw, largeMarkdownStyles } from "./styles.ts";

export function NamespaceDoc(
  { children, path = [] }: DocProps<DocNodeNamespace>,
) {
  const node = take(children);
  const { name, jsDoc, namespaceDef: { elements } } = node;
  const collection = asCollection(elements);
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
