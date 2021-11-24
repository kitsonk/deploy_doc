/** @jsx h */
import { Body } from "../components/body.tsx";
import { DocPage } from "../components/doc.tsx";
import { colors, doc, getStyleTag, h, renderSSR, Status, tw } from "../deps.ts";
import type {
  DocNode,
  DocNodeInterface,
  DocNodeNamespace,
  LoadResponse,
  RouterContext,
} from "../deps.ts";
import { sheet, store } from "../shared.ts";
import { assert, getBody } from "../util.ts";

const MAX_CACHE_SIZE = 25_000_000;
const cachedSpecifiers = new Set<string>();
const cachedResources = new Map<string, LoadResponse>();
const cachedEntries = new Map<string, DocNode[]>();
let cacheSize = 0;

function checkCache() {
  if (cacheSize > MAX_CACHE_SIZE) {
    const toEvict: string[] = [];
    for (const specifier of cachedSpecifiers) {
      const loadResponse = cachedResources.get(specifier);
      assert(loadResponse);
      toEvict.push(specifier);
      cacheSize -= loadResponse.content.length;
      if (cacheSize <= MAX_CACHE_SIZE) {
        break;
      }
    }
    for (const evict of toEvict) {
      cachedResources.delete(evict);
      cachedSpecifiers.delete(evict);
      cachedEntries.delete(evict);
    }
  }
}

let lastLoad = Date.now();

async function load(
  specifier: string,
): Promise<LoadResponse | undefined> {
  const url = new URL(specifier);
  try {
    switch (url.protocol) {
      case "file:": {
        console.error(`local specifier requested: ${specifier}`);
        return undefined;
      }
      case "http:":
      case "https:": {
        if (cachedResources.has(specifier)) {
          cachedSpecifiers.delete(specifier);
          cachedSpecifiers.add(specifier);
          return cachedResources.get(specifier);
        }
        const response = await fetch(String(url), { redirect: "follow" });
        if (response.status !== 200) {
          // ensure that resources are not leaked
          await response.arrayBuffer();
          return undefined;
        }
        const content = await response.text();
        const headers: Record<string, string> = {};
        for (const [key, value] of response.headers) {
          headers[key.toLowerCase()] = value;
        }
        const loadResponse: LoadResponse = {
          specifier: response.url,
          headers,
          content,
        };
        cachedResources.set(specifier, loadResponse);
        cachedSpecifiers.add(specifier);
        cacheSize += content.length;
        queueMicrotask(checkCache);
        lastLoad = Date.now();
        return loadResponse;
      }
      default:
        return undefined;
    }
  } catch {
    return undefined;
  }
}

function mergeEntries(entries: DocNode[]) {
  const merged: DocNode[] = [];
  const namespaces = new Map<string, DocNodeNamespace>();
  const interfaces = new Map<string, DocNodeInterface>();
  for (const node of entries) {
    if (node.kind === "namespace") {
      const namespace = namespaces.get(node.name);
      if (namespace) {
        namespace.namespaceDef.elements.concat(node.namespaceDef.elements);
        if (!namespace.jsDoc) {
          namespace.jsDoc = node.jsDoc;
        }
      } else {
        namespaces.set(node.name, node);
        merged.push(node);
      }
    } else if (node.kind === "interface") {
      const int = interfaces.get(node.name);
      if (int) {
        int.interfaceDef.callSignatures.concat(
          node.interfaceDef.callSignatures,
        );
        int.interfaceDef.indexSignatures.concat(
          node.interfaceDef.indexSignatures,
        );
        int.interfaceDef.methods.concat(node.interfaceDef.methods);
        int.interfaceDef.properties.concat(node.interfaceDef.properties);
        if (!int.jsDoc) {
          int.jsDoc = node.jsDoc;
        }
      } else {
        interfaces.set(node.name, node);
        merged.push(node);
      }
    } else {
      merged.push(node);
    }
  }
  return merged;
}

async function process<R extends string>(
  ctx: RouterContext<R>,
  url: string,
  item?: string | null,
) {
  let entries: DocNode[];
  if (cachedEntries.has(url)) {
    entries = cachedEntries.get(url)!;
  } else {
    try {
      const start = Date.now();
      entries = await doc(url, { load });
      const end = Date.now();
      console.log(
        ` ${colors.yellow("graph time")}: ${
          colors.bold(`${lastLoad - start}ms`)
        }`,
      );
      console.log(
        ` ${colors.yellow("doc time")}: ${colors.bold(`${end - lastLoad}ms`)}`,
      );
      entries = mergeEntries(entries);
      cachedEntries.set(url, entries);
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.includes("Unable to load specifier")) {
          ctx.throw(Status.NotFound, `The module "${url}" cannot be found.`);
        } else {
          ctx.throw(Status.BadRequest, `Bad request: ${e.message}`);
        }
      } else {
        ctx.throw(Status.InternalServerError, "Unexpected object.");
      }
    }
  }

  store.setState({ entries, url });
  sheet.reset();
  ctx.response.body = getBody(
    renderSSR(
      <Body>
        <DocPage>{item}</DocPage>
      </Body>,
    ),
    getStyleTag(sheet),
    item ? `${url} — ${item}` : url,
  );
  ctx.response.type = "html";
}

export const pathGetHead = async <R extends string>(ctx: RouterContext<R>) => {
  const url = `${ctx.params.proto}://${ctx.params.host}/${
    ctx.params.path ??
      ""
  }`;
  const item = ctx.params.item;
  if (ctx.params.proto === "deno" && !cachedEntries.has(url)) {
    const res = await fetch(
      new URL(`../static/${ctx.params.host}.json`, import.meta.url),
    );
    if (res.status === 200) {
      cachedEntries.set(url, mergeEntries(await res.json()));
    }
  }
  return process(ctx, url, item);
};

export const docGet = (ctx: RouterContext<"/doc">) => {
  const url = ctx.request.url.searchParams.get("url");
  ctx.assert(url, Status.BadRequest, "The query property `url` is missing.");
  const item = ctx.request.url.searchParams.get("item");
  return process(ctx, url, item);
};
