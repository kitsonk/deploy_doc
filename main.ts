#!/usr/bin/env -S deno run --allow-read --allow-net

import { Application, colors, HttpError, Router } from "./deps.ts";
import { handleErrors } from "./middleware/errors.tsx";
import { createFaviconMW } from "./middleware/favicon.ts";
import { logging, timing } from "./middleware/logging.ts";
import { docGet, pathGetHead } from "./routes/doc.tsx";
import { indexGet } from "./routes/index.tsx";

const router = new Router();

router.get("/", indexGet);
router.get("/:proto(http|https)/:host/:path*/~/:item+", pathGetHead);
router.get("/:proto(http|https)/:host/:path*", pathGetHead);
router.head("/:proto(http|https)/:host/:path*/~/:item+", pathGetHead);
router.head("/:proto(http|https)/:host/:path*", pathGetHead);
router.get("/:proto(deno)/:host", pathGetHead);
router.get("/:proto(deno)/:host/~/:item+", pathGetHead);
router.head("/:proto(deno)/:host", pathGetHead);
router.head("/:proto(deno)/:host/~/:item+", pathGetHead);
router.get("/doc", docGet);
router.get("/img/:path*", async (ctx, next) => {
  const { render } = await import(
    "https://deno.land/x/resvg_wasm@0.1.0/mod.ts"
  );
  const res = await fetch(
    new URL(`./static/${ctx.params.path}.svg`, import.meta.url),
  );
  ctx.response.body = render(await res.text());
  ctx.response.type = "png";
  await next();
});

const app = new Application();

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

app.listen({ port: 8080 });
