/** @jsx h */
import { Body } from "../components/body.tsx";
import { DocPrinter } from "../components/doc.tsx";
import { doc, getStyleTag, h, renderSSR, Status } from "../deps.ts";
import type { DocNode, RouterContext, RouterMiddleware } from "../deps.ts";
import { sheet } from "../shared.ts";
import { getBody } from "../util.ts";

export const docGetPost: RouterMiddleware = async (ctx: RouterContext) => {
  sheet.reset();
  ctx.assert(ctx.request.method === "GET" || ctx.request.method === "POST");
  let root: string;
  if (ctx.request.hasBody) {
    const body = ctx.request.body();
    ctx.assert(
      body.type === "form" || body.type === "form-data",
      Status.BadRequest,
      "Only form or form-data bodies supported.",
    );
    switch (body.type) {
      case "form": {
        const bodyValue = await body.value;
        const url = bodyValue.get("url");
        ctx.assert(url, Status.BadRequest, `Missing "url" property in form.`);
        root = url;
        break;
      }
      case "form-data": {
        const bodyValue = await body.value.read();
        const url = bodyValue.fields["url"];
        ctx.assert(
          url,
          Status.BadRequest,
          `Missing "url" property in form-data.`,
        );
        root = url;
      }
    }
  } else {
    const url = ctx.request.url.searchParams.get("url");
    ctx.assert(url, Status.BadRequest, `Missing "url" query.`);
    root = url;
  }

  let entries: DocNode[];
  try {
    entries = await doc(root);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.includes("Unable to load specifier")) {
        ctx.throw(Status.NotFound, `The module "${root}" cannot be found.`);
      } else {
        ctx.throw(Status.BadRequest, `Bad request: ${e.message}`);
      }
    } else {
      ctx.throw(Status.InternalServerError, "Unexpected object.");
    }
  }
  ctx.response.body = getBody(
    renderSSR(
      <Body title="Deploy Doc" subtitle={root}>
        <DocPrinter entries={entries} />
      </Body>,
    ),
    getStyleTag(sheet),
    root,
  );
  ctx.response.type = "html";
};
