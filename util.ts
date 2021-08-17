export function assert(cond: unknown, msg = "Assertion failed"): asserts cond {
  if (!cond) {
    throw new Error(msg);
  }
}

/**
 * @param bytes Number of bytes
 * @param si If `true` use metric (SI) unites (powers of 1000). If `false` use
 *           binary (IEC) (powers of 1024). Defaults to `true`.
 * @param dp Number of decimal places to display. Defaults to `1`.
 */
export function humanSize(bytes: number, si = true, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1
  );

  return `${bytes.toFixed(dp)} ${units[u]}`;
}

export function getBody(
  body: string,
  styles: string,
  pageTitle?: string,
  includeMeta = false,
): string {
  const meta = includeMeta
    ? `
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content="@denoland" />
  <meta name="twitter:creator" content="@kitsonk" />
  <meta name="twitter:image:alt" content="Deploy Doc logo" />
  <meta property="og:title" content="Deploy Doc" />
  <meta property="og:description" content="An example web application using Deno CLI's documentation logic on Deno Deploy to create on demand documentation." />
  `
    : "";
  return `<!DOCTYPE html>
  <html>
    <head>
      <title>Deploy Doc${pageTitle ? ` – ${pageTitle}` : ""}</title>
      ${styles}
      ${meta}
    </head>
    ${body}
  </html>`;
}

export function isEven(n: number) {
  return !(n % 2);
}
