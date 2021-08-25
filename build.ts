#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-env

import { colors, doc } from "./deps.ts";

await Deno.permissions.request({ name: "read" });
await Deno.permissions.request({ name: "write" });

console.log(`${colors.bold(colors.green("Building"))} deploy_doc...`);

console.log(
  `${colors.bold(colors.green("Documenting"))} Deno CLI built-ins...`,
);
const builtInDoc = await doc("https://doc-proxy.deno.dev/builtin/stable");
console.log(
  `${colors.bold(colors.green("Saving"))} Deno CLI built-ins...`,
);
await Deno.writeTextFile("./static/stable.json", JSON.stringify(builtInDoc));

console.log(
  `${colors.bold(colors.green("Documenting"))} Deno CLI unstable built-ins...`,
);
const unstableDoc = await doc(
  "https://raw.githubusercontent.com/denoland/deno/main/cli/dts/lib.deno.unstable.d.ts",
);
console.log(
  `${colors.bold(colors.green("Saving"))} Deno CLI unstable built-ins...`,
);
await Deno.writeTextFile(
  "./static/unstable.json",
  JSON.stringify(unstableDoc),
);

console.log(`${colors.bold(colors.green("Documenting"))} lib esnext...`);
const libEsnextPromises = [
  "es5",
  "es2015.collection",
  "es2015.core",
  "es2015",
  "es2015.generator",
  "es2015.iterable",
  "es2015.promise",
  "es2015.proxy",
  "es2015.reflect",
  "es2015.symbol",
  "es2015.symbol.wellknown",
  "es2016.array.include",
  "es2016",
  "es2017",
  "es2017.intl",
  "es2017.object",
  "es2017.sharedmemory",
  "es2017.string",
  "es2017.typedarrays",
  "es2018.asyncgenerator",
  "es2018.asynciterable",
  "es2018",
  "es2018.intl",
  "es2018.promise",
  "es2018.regexp",
  "es2019.array",
  "es2019",
  "es2019.object",
  "es2019.string",
  "es2019.symbol",
  "es2020.bigint",
  "es2020",
  "es2020.intl",
  "es2020.promise",
  "es2020.sharedmemory",
  "es2020.string",
  "es2020.symbol.wellknown",
  "es2021",
  "es2021.promise",
  "es2021.string",
  "es2021.weakref",
  "esnext",
  "esnext.error",
  "esnext.intl",
  "esnext.object",
  "esnext.promise",
  "esnext.string",
  "esnext.weakref",
].map((lib) =>
  doc(
    `https://raw.githubusercontent.com/denoland/deno/main/cli/dts/lib.${lib}.d.ts`,
  )
);
const esnextDoc = (await Promise.all(libEsnextPromises)).flat();
console.log(
  `${colors.bold(colors.green("Saving"))} lib esnext...`,
);
await Deno.writeTextFile(
  "./static/esnext.json",
  JSON.stringify(esnextDoc),
);

console.log(`${colors.bold(colors.green("Documenting"))} lib dom...`);
const domPromises = ["dom", "dom.iterable", "dom.asynciterable"].map((lib) =>
  doc(
    `https://raw.githubusercontent.com/denoland/deno/main/cli/dts/lib.${lib}.d.ts`,
  )
);
console.log(`${colors.bold(colors.green("Saving"))} lib dom...`);
const domDoc = (await Promise.all(domPromises)).flat();
await Deno.writeTextFile("./static/dom.json", JSON.stringify(domDoc));

console.log(colors.bold(colors.green("Done.")));
