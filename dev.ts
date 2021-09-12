#!/usr/bin/env -S deno run --unstable --allow-read --allow-net

import {
  createWorker,
  handlers,
} from "https://deno.land/x/dectyl@0.10.5/mod.ts";

await Deno.permissions.request({ name: "read" });
await Deno.permissions.request({ name: "net" });

const deployDoc = await createWorker("./main.ts", {
  name: "deployDoc",
  bundle: false,
  fetchHandler: handlers.fileFetchHandler,
});

(async () => {
  for await (const log of deployDoc.logs) {
    console.log(`[${deployDoc.name}]: ${log}`);
  }
})();

const listenOptions = { port: 8080 };
await deployDoc.listen(listenOptions);
console.log(
  `Listening on: http://0.0.0.0:${listenOptions.port}/`,
);
