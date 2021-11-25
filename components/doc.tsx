/** @jsx h */
import { h, tw } from "../deps.ts";
import type { DocNode, DocNodeFunction, DocNodeNamespace } from "../deps.ts";
import { store, StoreState } from "../shared.ts";
import { assert, parseURL, take } from "../util.ts";
import type { Child } from "../util.ts";
import { ClassDoc } from "./classes.tsx";
import {
  asCollection,
  IconLink,
  Markdown,
  Section,
  TocLink,
} from "./common.tsx";
import type { DocNodeCollection } from "./common.tsx";
import { EnumDoc } from "./enums.tsx";
import { ErrorMessage } from "./error.tsx";
import { FnDoc } from "./functions.tsx";
import { InterfaceDoc } from "./interfaces.tsx";
import { NamespaceDoc } from "./namespaces.tsx";
import { gtw, largeMarkdownStyles } from "./styles.ts";
import { TypeAliasDoc } from "./types.tsx";
import { VariableDoc } from "./variables.tsx";

function assertAll<N extends DocNode>(
  nodes: DocNode[],
  kind: DocNode["kind"],
): asserts nodes is N[] {
  if (!nodes.every((n) => n.kind === kind)) {
    throw new Error(`Not every node of kind "${kind}".`);
  }
}

function ModuleToc(
  { children, library = false }: {
    children: Child<DocNodeCollection>;
    library?: boolean;
  },
) {
  const collection = take(children);
  const imports = collection.import
    ? collection.import.map((imp) => <li>{imp.importDef.src}</li>)
    : undefined;
  return (
    <div>
      <h3 class={tw`text-gray-900 mt-3 mb-1 text-xl font-bold`}>
        This {library ? "Library" : "Module"}
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
      {imports &&
        (
          <div>
            <h3 class={tw`text-gray-900 mt-3 mb-1 text-xl font-bold`}>
              Imports
            </h3>
            <ul>{imports}</ul>
          </div>
        )}
    </div>
  );
}

function DocNodes({ children }: { children: Child<DocNodeCollection> }) {
  const collection = take(children);
  return (
    <div class={gtw("mainBox")}>
      {collection.moduleDoc && (
        <Markdown style={largeMarkdownStyles}>
          {collection.moduleDoc[0].jsDoc}
        </Markdown>
      )}
      {collection.namespace && (
        <Section title="Namespaces" style="nodeNamespace">
          {collection.namespace}
        </Section>
      )}
      {collection.class && (
        <Section title="Classes" style="nodeClass">
          {collection.class}
        </Section>
      )}
      {collection.enum && (
        <Section title="Enums" style="nodeEnum">
          {collection.enum}
        </Section>
      )}
      {collection.variable && (
        <Section title="Variables" style="nodeVariable">
          {collection.variable}
        </Section>
      )}
      {collection.function && (
        <Section title="Functions" style="nodeFunction">
          {collection.function}
        </Section>
      )}
      {collection.interface && (
        <Section title="Interfaces" style="nodeInterface">
          {collection.interface}
        </Section>
      )}
      {collection.typeAlias && (
        <Section title="Types" style="nodeTypeAlias">
          {collection.typeAlias}
        </Section>
      )}
    </div>
  );
}

function DocEntry({ children }: { children: Child<string> }) {
  const item = take(children);
  const path = item.split(".");
  const name = path.pop()!;
  let { entries, url } = store.state as StoreState;
  if (path && path.length) {
    for (const name of path) {
      const namespace = entries.find((n) =>
        n.kind === "namespace" && n.name === name
      ) as DocNodeNamespace | undefined;
      if (namespace) {
        entries = namespace.namespaceDef.elements;
      }
    }
  }
  const nodes = entries.filter((e) => e.name === name && e.kind !== "import");
  if (!nodes.length) {
    return (
      <ErrorMessage title="Entry not found">
        The document entry named "{path ? [...path, name].join(".") : name}" was
        not found in specifier "{url}".
      </ErrorMessage>
    );
  }
  switch (nodes[0].kind) {
    case "class":
      assert(nodes.length === 1);
      return <ClassDoc path={path}>{nodes[0]}</ClassDoc>;
    case "enum":
      assert(nodes.length === 1);
      return <EnumDoc path={path}>{nodes[0]}</EnumDoc>;
    case "function":
      assertAll<DocNodeFunction>(nodes, "function");
      return <FnDoc path={path}>{nodes}</FnDoc>;
    case "interface":
      assert(nodes.length === 1);
      return <InterfaceDoc path={path}>{nodes[0]}</InterfaceDoc>;
    case "namespace":
      assert(nodes.length === 1);
      return <NamespaceDoc path={path}>{nodes[0]}</NamespaceDoc>;
    case "typeAlias":
      assert(nodes.length === 1);
      return <TypeAliasDoc path={path}>{nodes[0]}</TypeAliasDoc>;
    case "variable":
      assert(nodes.length === 1);
      return <VariableDoc path={path}>{nodes[0]}</VariableDoc>;
    default:
      return (
        <ErrorMessage title="Not Supported">
          The kind of "{nodes[0].kind}" is currently not supported.
        </ErrorMessage>
      );
  }
}

export function DocPage(
  { children }: { children: Child<string | null | undefined> },
) {
  const item = take(children);
  const { entries, url, includePrivate } = store.state as StoreState;
  const collection = asCollection(entries, includePrivate);
  return (
    <div
      class={tw`max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-4`}
    >
      <SideBar item={item} url={url}>{collection}</SideBar>
      {item ? <DocEntry>{item}</DocEntry> : <DocNodes>{collection}</DocNodes>}
    </div>
  );
}

function SideBarHeader({ children }: { children: Child<string> }) {
  const url = take(children);
  const parsed = parseURL(url);
  const href = `/${url.replace("://", "/")}`;
  if (parsed) {
    const module = parsed.module
      ? parsed.module.replaceAll("/", "&#8203;/")
      : undefined;
    let title = module;
    let subtitle;
    if (parsed.org) {
      if (module) {
        subtitle = `${parsed.org}/${parsed.package}`;
      } else {
        title = `${parsed.org}/${parsed.package}`;
      }
    } else if (parsed.package) {
      if (module) {
        subtitle = parsed.package;
      } else {
        title = parsed.package;
      }
    } else if (parsed.registry === "deno.land/std") {
      subtitle = "std";
    }
    return (
      <div>
        <h2 class={tw`text-gray-900 text-2xl font-bold`}>
          <a href={href} class={tw`hover:underline`}>
            {title}
          </a>
        </h2>
        {subtitle && (
          <h3 class={tw`text-gray-900 text-xl font-bold`}>{subtitle}</h3>
        )}
        <h3 class={tw`text-gray-600 text-sm mt-2`}>Registry</h3>
        <p class={tw`truncate`}>{parsed.registry}</p>
        {parsed.org && (
          <div>
            <h3 class={tw`text-gray-600 text-sm mt-2`}>Organization</h3>
            <p class={tw`truncate`}>{parsed.org}</p>
          </div>
        )}
        {parsed.package && (
          <div>
            <h3 class={tw`text-gray-600 text-sm mt-2`}>Package</h3>
            <p class={tw`truncate`}>{parsed.package}</p>
          </div>
        )}
        {module && (
          <div>
            <h3 class={tw`text-gray-600 text-sm mt-2`}>Module</h3>
            <p class={tw`truncate`}>{module}</p>
          </div>
        )}
        <div>
          <h3 class={tw`text-gray-600 text-sm mt-2`}>Source</h3>
          <p class={tw`truncate`}>
            <a href={url} target="_blank" class={tw`truncate`}>
              <IconLink />
              {url}
            </a>
          </p>
        </div>
      </div>
    );
  } else {
    let name;
    switch (url) {
      case "deno://stable/":
        name = "Deno Stable APIs";
        break;
      case "deno://unstable/":
        name = "Deno Unstable APIs";
        break;
      case "deno://esnext/":
        name = "ESNext APIs";
        break;
      case "deno://dom/":
        name = "DOM APIs";
        break;
      default:
        // strip the protocol and insert zws so paths break
        name = url.replace(/^\S+:\/{2}/, "").replaceAll("/", "&#8203;/");
    }
    return (
      <h2 class={tw`text-gray-900 text-2xl font-bold`}>
        <a href={href} class={tw`hover:underline`}>{name}</a>
      </h2>
    );
  }
}

function SideBar(
  { children, item, url }: {
    children: Child<DocNodeCollection>;
    item?: string | null;
    url: string;
  },
) {
  const collection = take(children);
  const library = url.startsWith("deno:");
  return (
    <nav class={tw`p-6 sm:py-12 md:border-r md:border-gray-200`}>
      <SideBarHeader>{url}</SideBarHeader>
      {item ?? <ModuleToc library={library}>{collection}</ModuleToc>}
    </nav>
  );
}
