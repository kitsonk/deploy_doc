#!/usr/bin/env -S deno run --unstable --allow-read --allow-net --no-check

import { createWorker } from "https://deno.land/x/dectyl@0.10.4/mod.ts";

await Deno.permissions.request({ name: "read" });
await Deno.permissions.request({ name: "net" });

const deployDoc = await createWorker("./main.ts", {
  name: "deployDoc",
  bundle: false,
});

(async () => {
  for await (const log of deployDoc.logs) {
    console.log(`[${deployDoc.name}]: ${log}`);
  }
})();

const listenOptions = { hostname: "localhost", port: 8080 };
await deployDoc.listen(listenOptions);
console.log(
  `Listening on: http://${listenOptions.hostname}:${listenOptions.port}/`,
);
