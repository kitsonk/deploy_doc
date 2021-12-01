#!/usr/bin/env -S deno run --allow-read --allow-net

import {
  Application,
  colors,
  HttpError,
  lookup,
  proxy,
  Router,
} from "./deps.ts";
import { handleErrors } from "./middleware/errors.tsx";
import { createFaviconMW } from "./middleware/favicon.ts";
import { logging, timing } from "./middleware/logging.ts";
import { docGet, imgGet, pathGetHead } from "./routes/doc.tsx";
import { indexGet } from "./routes/index.tsx";

const router = new Router();

router.get("/", indexGet);
router.get("/:proto(http:|https:)//:host/:path*/~/:item+", pathGetHead);
router.get("/:proto(http:|https:)//:host/:path*", pathGetHead);
router.head("/:proto(http:|https:)//:host/:path*/~/:item+", pathGetHead);
router.head("/:proto(http:|https:)//:host/:path*", pathGetHead);
router.get("/:proto(deno)//:host", pathGetHead);
router.get("/:proto(deno)//:host/~/:item+", pathGetHead);
router.head("/:proto(deno)//:host", pathGetHead);
router.head("/:proto(deno)//:host/~/:item+", pathGetHead);
router.get("/doc", docGet);
router.get(
  "/static/:path*",
  proxy(new URL("./", import.meta.url), {
    contentType(url, contentType) {
      return lookup(url) ?? contentType;
    },
  }),
);
router.get("/img/:proto(http|https:)//:host/:path*/~/:item+", imgGet);
router.get("/img/:proto(http|https:)//:host/:path*", imgGet);
router.get("/img/:proto(deno)//:host", imgGet);
router.get("/img/:proto(deno)//:host/~/:item+", imgGet);

// redirects from legacy doc website
router.get("/builtin/stable", (ctx) => ctx.response.redirect("/deno//stable"));

export const app = new Application();

app.use(logging);
app.use(timing);
app.use(createFaviconMW("https://deno.land/favicon.ico"));
app.use(handleErrors);

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", (evt) => {
  console.log(
    `listening on ${
      evt.secure ? "https" : "http"
    }://${evt.hostname}:${evt.port}/`,
  );
});

app.addEventListener("error", (evt) => {
  let msg = `[${colors.red("error")}] `;
  if (evt.error instanceof Error) {
    msg += `${evt.error.name}: ${evt.error.message}`;
  } else {
    msg += Deno.inspect(evt.error);
  }
  if (
    (evt.error instanceof HttpError && evt.error.status >= 400 &&
      evt.error.status <= 499)
  ) {
    if (evt.context) {
      msg += `\n\nrequest:\n  url: ${evt.context.request.url}\n  headers: ${
        Deno.inspect([...evt.context.request.headers])
      }\n`;
    }
  }
  if (evt.error instanceof Error && evt.error.stack) {
    const stack = evt.error.stack.split("\n");
    stack.shift();
    msg += `\n\n${stack.join("\n")}\n`;
  }
  console.error(msg);
});

// we only listen if this is the main module, which allows use to facilitate
// testing by lazily listening within the test harness
if (Deno.mainModule === import.meta.url) {
  app.listen({ port: 8080 });
}
