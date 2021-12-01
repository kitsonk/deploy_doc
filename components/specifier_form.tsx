/** @jsx h */
import { h, tw } from "../deps.ts";
import { gtw } from "./styles.ts";

interface DocLinksProps {
  children: string[];
}

function DocLinks({ children }: DocLinksProps) {
  const links = children.map((child) => (
    <li>
      <a class={gtw("link")} href={`/${child}`}>
        <code>{child}</code>
      </a>
    </li>
  ));
  return <ul class={gtw("list")}>{links}</ul>;
}

export function SpecifierForm() {
  return (
    <main class={tw`max-w-screen-md px-4 pt-16 mx-auto text-gray-900`}>
      <h1 class={tw`text-5xl font-bold`}>Deno Doc</h1>
      <div
        class={tw`p-6 md:(col-span-3 p-12)`}
      >
        <div class={tw`space-y-6`}>
          <p>
            <a href="/deno//stable">
              <button class={gtw("formButton")} type="button">
                Deno CLI APIs (Stable)
              </button>
            </a>
          </p>
          <p>
            <a href="/deno//unstable">
              <button class={gtw("formButton")} type="button">
                Deno CLI APIs (<code>--unstable</code>)
              </button>
            </a>
          </p>
        </div>
        <div class={tw`text-center my-6`}>or view documentation for</div>
        <div>
          <form
            class={tw
              `relative text-gray-500 focus-within:text-gray-700 sm:col-span-6`}
            action="/doc"
            method="get"
          >
            <label
              for="url"
              class={tw
                `absolute z-10 ml-4 mt-0.5 px-1.5 tracking-wider bg-white text-gray-400 font-medium text-sm transition`}
            >
              URL to Document
            </label>
            <div class={tw`pt-3 w-full`}>
              <div
                class={tw
                  `relative border border-gray-300 focus-within:border-gray-500 rounded-xl overflow-hidden transition flex`}
              >
                <input
                  id="url"
                  name="url"
                  type="text"
                  class={tw
                    `w-full outline-none px-6 py-4 bg-white text-gray-800 focus:text-gray-900`}
                  label="URL to Document"
                />
              </div>
            </div>
            <div class={tw`absolute right-2 bottom-2 hidden lg:block`}>
              <button class={gtw("insideButton")} type="submit">
                Document
              </button>
            </div>
          </form>
        </div>
        <div class={tw`space-y-6 mt-8`}>
          <p>
            Some samples of documentation:
            <DocLinks>
              {"https://deno.land/std/fs/mod.ts"}
              {"https://deno.land/x/oak/mod.ts"}
              {"https://deno.land/x/redis/mod.ts"}
              {"https://deno.land/x/amqp/mod.ts"}
              {"https://cdn.skypack.dev/@firebase/firestore?dts"}
              {"https://esm.sh/preact"}
              {"https://deno.land/std/archive/tar.ts"}
              {"https://deno.land/std/node/http.ts"}
            </DocLinks>
          </p>
          <p>
            The source for this web application is available at{" "}
            <a
              class={gtw("url")}
              href="https://github.com/kitsonk/deploy_doc"
              target="_blank"
            >
              github.com/kitsonk/deploy_doc
            </a>.
          </p>
          <p>
            It can also be{" "}
            <a
              class={tw
                `transition focus-visible:ring-2 focus-visible:ring-black focus:outline-none my-1 py-2 px-2.5 text-base text-gray-600 border border-gray-300 rounded-xl hover:shadow hidden lg:inline h-full`}
              href={`https://dash.deno.com/new?url=${
                encodeURIComponent(
                  "https://raw.githubusercontent.com/kitsonk/deploy_doc/main/main.ts",
                )
              }`}
              target="_blank"
            >
              Deployed...
            </a>{" "}
            into its own deployment as well.
          </p>
        </div>
      </div>
    </main>
  );
}
