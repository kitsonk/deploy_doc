/** @jsx h */
import { App } from "../components/app.tsx";
import { SpecifierForm } from "../components/specifier_form.tsx";
import { getStyleTag, h, Helmet, renderSSR } from "../deps.ts";
import type { RouterMiddleware } from "../deps.ts";
import { sheet } from "../shared.ts";
import { getBody } from "../util.ts";

function Meta() {
  return (
    <Helmet>
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@denoland" />
      <meta name="twitter:creator" content="@kitsonk" />
      <meta
        name="twitter:image"
        content="https://deno-doc.deno.dev/img/banner"
      />
      <meta name="twitter:image:alt" content="Deno Doc logo" />
      <meta property="og:title" content="Deploy Doc" />
      <meta
        property="og:description"
        content="An example web application using Deno CLI's documentation logic on Deno Deploy to create on demand documentation."
      />
      <meta
        name="description"
        content="An example web application using Deno CLI's documentation logic on Deno Deploy to create on demand documentation."
      />
    </Helmet>
  );
}

export const indexGet: RouterMiddleware<"/"> = (ctx) => {
  sheet.reset();
  const page = renderSSR(
    <App>
      <Meta />
      <SpecifierForm />
    </App>,
  );
  ctx.response.body = getBody(
    Helmet.SSR(page),
    getStyleTag(sheet),
  );
  ctx.response.type = "html";
};
