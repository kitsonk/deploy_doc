# deploy_doc

A Deno CLI/Deploy server which generates documentation for arbitrary JavaScript
and TypeScript modules.

## Overview

When a documentation page is requested, the following occurs at a high level:

- The request URL is processed by the oak router, matching the URL to the route
  patterns.
- When it is matched to a documentation page, the middleware checks to see if
  the documentation JSON structure is in memory.
- If the module isn't in memory, the middleware will attempt to generate the
  documentation JSON structure.
- It calls the `doc()` function from [`deno_doc`](https://deno.land/x/deno_doc)
  with a custom in memory caching loader function.
- `doc()` uses [`deno_graph`](https://deno.land/x/deno_graph) and
  [swc](https://swc.rs/) to generate the documentation JSON structure.
- Once the structure is generated, it uses
  [Nano JSX](https://nanojsx.github.io/) and [twind](https://twind.dev/) to
  server side render a JSX/TSX structure which generates itself based off the
  JSON documentation structure.
- This is then passed back the the requestor.
- If the URL matched is a "card" image, this is server side rendered as a
  JSX/TSX SVG which is then rendered as a PNG using
  [resvg_wasm](https://deno.land/x/resvg_wasm).
