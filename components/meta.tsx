/** @jsx h */
import { h, Helmet, removeMarkdown } from "../deps.ts";

function getLabel(url: string) {
  switch (url) {
    case "deno//stable/":
      return "Deno CLI Stable APIs";
    case "deno//unstable/":
      return "Deno Unstable Stable APIs";
    case "deno//esnext/":
      return "ESNext APIs";
    case "deno//dom/":
      return "DOM APIs";
    default:
      return url.replace(/^\S+:\/{2}/, "");
  }
}

export function Meta(
  { url, doc, item }: { url: string; doc: string; item?: string },
) {
  const description = removeMarkdown(doc);
  const href = item ? `${url}${url.endsWith("/") ? "" : "/"}~/${item}` : url;
  const imageUrl = `https://deno-doc.deno.dev/${href}`;
  const title = item
    ? `Deno Doc - ${getLabel(url)} - ${item}`
    : `Deno Doc - ${getLabel(url)}`;
  return (
    <Helmet>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@denoland" />
      <meta name="twitter:creator" content="@denoland" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content="rendered description as image" />
      <meta name="twitter:description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content="rendered description as image" />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta name="description" content={description} />
    </Helmet>
  );
}
