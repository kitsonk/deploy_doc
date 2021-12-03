// Copyright 2021 the Deno authors. All rights reserved. MIT license.
/** @jsx h */
import { getStyleTag, h, Helmet, renderSSR, Status, tw } from "../deps.ts";
import type { Middleware } from "../deps.ts";
import { sheet } from "../shared.ts";
import { getBody } from "../util.ts";
import { App } from "../components/app.tsx";
import { ErrorMessage } from "../components/error.tsx";
import { gtw } from "../components/styles.ts";

function ErrorBody({ children, title }: { children: unknown; title: string }) {
  return (
    <main class={gtw("main")}>
      <h1 class={gtw("mainHeader")}>Deno Doc</h1>
      <ErrorMessage title={title}>{children}</ErrorMessage>
    </main>
  );
}

export const handleNotFound: Middleware = async (ctx, next) => {
  await next();
  if (ctx.response.status === Status.NotFound) {
    if (ctx.request.accepts("text/html")) {
      sheet.reset();
      const page = renderSSR(
        <App>
          <ErrorBody title="Not Found">
            The requested URL ({`<code>"${ctx.request.url}"</code>`}) was not
            found.
          </ErrorBody>
        </App>,
      );
      ctx.response.body = getBody(
        Helmet.SSR(page),
        getStyleTag(sheet),
      );
    }
  }
};
