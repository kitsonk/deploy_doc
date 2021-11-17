/** @jsx h */
import { Body } from "../components/body.tsx";
import { SpecifierForm } from "../components/specifier_form.tsx";
import { getStyleTag, h, renderSSR } from "../deps.ts";
import type { RouterMiddleware } from "../deps.ts";
import { sheet } from "../shared.ts";
import { getBody } from "../util.ts";

export const indexGet: RouterMiddleware<"/"> = (ctx) => {
  sheet.reset();
  ctx.response.body = getBody(
    renderSSR(
      <Body title="Deploy Doc" subtitle="">
        <SpecifierForm />
      </Body>,
    ),
    getStyleTag(sheet),
    undefined,
    true,
  );
  ctx.response.type = "html";
};
