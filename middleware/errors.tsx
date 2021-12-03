// Copyright 2021 the Deno authors. All rights reserved. MIT license.
/** @jsx h */
import {
  getStyleTag,
  h,
  Helmet,
  HttpError,
  renderSSR,
  Status,
  STATUS_TEXT,
  tw,
} from "../deps.ts";
import type { Context, Middleware } from "../deps.ts";
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

function htmlErrorBody(status: Status, msg: string) {
  const page = renderSSR(
    <App>
      <ErrorBody title={STATUS_TEXT.get(status) ?? "Internal Error"}>
        {msg}
      </ErrorBody>
    </App>,
  );
  return getBody(
    Helmet.SSR(page),
    getStyleTag(sheet),
  );
}

function setResponse(
  ctx: Context,
  accepts: string | undefined,
  status: Status,
  message: string,
) {
  ctx.response.status = status;
  if (accepts === "text/html") {
    ctx.response.body = htmlErrorBody(status, message);
    ctx.response.type = "html";
  } else if (accepts === "application/json") {
    ctx.response.body = { status, text: STATUS_TEXT.get(status), message };
    ctx.response.type = "json";
  } else {
    ctx.response.body = `Error: [${status} ${
      STATUS_TEXT.get(status)
    }] ${message}`;
    ctx.response.type = "text/plain";
  }
}

export const handleErrors: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    sheet.reset();
    const accepts = ctx.request.accepts("text/html", "application/json");
    if (err instanceof HttpError) {
      setResponse(ctx, accepts, err.status, err.message);
      if (err.expose) {
        return;
      }
    } else if (err instanceof Error) {
      setResponse(ctx, accepts, Status.InternalServerError, err.message);
    } else {
      setResponse(
        ctx,
        accepts,
        Status.InternalServerError,
        "[non-error-thrown]",
      );
    }
    throw err;
  }
};
