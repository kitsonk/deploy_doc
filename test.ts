import { createWorker } from "https://deno.land/x/dectyl@0.10.4/mod.ts";

Deno.test({
  name: "route - /",
  async fn() {
    const denoDoc = await createWorker("./main.ts", {
      name: "denoDoc",
      bundle: false,
    });
    await denoDoc.run(async () => {
      const [response] = await denoDoc.fetch("/");
      console.log(await response.text());
    });
  },
});
