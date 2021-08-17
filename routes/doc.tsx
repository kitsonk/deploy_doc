/** @jsx h */
import { Body } from "../components/body.tsx";
import { DocEntry, DocPrinter } from "../components/doc.tsx";
import { colors, doc, getStyleTag, h, renderSSR, Status } from "../deps.ts";
import type {
  DocNode,
  DocNodeKind,
  LoadResponse,
  RouterContext,
  RouterMiddleware,
} from "../deps.ts";
import { sheet } from "../shared.ts";
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

export const docGet: RouterMiddleware = async (ctx: RouterContext) => {
  sheet.reset();
  ctx.assert(ctx.request.method === "GET");
  const url = ctx.request.url.searchParams.get("url");
  ctx.assert(url, Status.BadRequest, `Missing "url" query.`);

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
  const name = ctx.request.url.searchParams.get("name");
  const kind = ctx.request.url.searchParams.get("kind");
  ctx.response.body = getBody(
    renderSSR(
      <Body title="Deploy Doc" subtitle={url}>
        {name && kind
          ? (
            <DocEntry
              entries={entries}
              name={name}
              kind={kind as DocNodeKind}
              url={url}
            />
          )
          : <DocPrinter entries={entries} url={url} />}
      </Body>,
    ),
    getStyleTag(sheet),
    url,
  );
  ctx.response.type = "html";
};
