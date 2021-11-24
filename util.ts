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
  <meta name="description" content="An example web application using Deno CLI's documentation logic on Deno Deploy to create on demand documentation." />
  `
    : "";
  return `<!DOCTYPE html>
  <html lang="en">
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

export type Child<T> = T | [T];

/** A utility function that inspects a value, and if the value is an array,
 * returns the first element of the array, otherwise returns the value. This is
 * used to deal with the ambiguity around children properties with nano_jsx. */
export function take<T>(value: Child<T>, itemIsArray = false): T {
  if (itemIsArray) {
    return Array.isArray(value) && Array.isArray(value[0]) ? value[0] : // deno-lint-ignore no-explicit-any
      value as any;
  } else {
    return Array.isArray(value) ? value[0] : value;
  }
}

const patterns = {
  "deno.land/x": new URLPattern(
    "https://deno.land/x/:pkg([^@/]+){@}?:ver?/:mod*",
  ),
  "deno.land/std": new URLPattern("https://deno.land/std{@}?:ver?/:mod*"),
  "nest.land": new URLPattern("https://x.nest.land/:pkg([^@/]+)@:ver/:mod*"),
  "github.com": new URLPattern(
    "https://raw.githubusercontent.com/:org/:pkg/:ver/:mod*",
  ),
  "esm.sh": new URLPattern("https://esm.sh/:pkg([^@/]+){@}?:ver?/:mod?"),
  "skypack.dev": new URLPattern(
    "https://cdn.skypack.dev/:pkg([^@/]+){@}?:ver?/:mod?",
  ),
} as const;

interface ParsedURL {
  registry: string;
  org?: string;
  package?: string;
  version?: string;
  module?: string;
}

export function parseURL(url: string): ParsedURL | undefined {
  for (const [registry, pattern] of Object.entries(patterns)) {
    const match = pattern.exec(url);
    if (match) {
      const { pathname: { groups: { org, pkg, ver, mod } } } = match;
      return {
        registry,
        org: org ? org : undefined,
        package: pkg ? pkg : undefined,
        version: ver ? ver : undefined,
        module: mod ? mod : undefined,
      };
    }
  }
}
