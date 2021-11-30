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
      <h1 class={tw`text-5xl font-bold`}>Deno Doc on Deploy</h1>
      <form
        action="/doc"
        method="get"
        class={tw`p-6 md:(col-span-3 p-12)`}
      >
        <div class={tw`space-y-6`}>
          <p>
            This website utilizes the <code>deno_doc</code>{" "}
            crate as a Web Assembly library under Deno Deploy. The{" "}
            <code>deno_doc</code> crate is what is used for the{" "}
            <code>deno doc</code> subcommand and powers{" "}
            <code>doc.deno.land</code>.
          </p>
          <p>
            You can take it for a test spin by supplying a URL module specifier
            below, which will be fetched by the Deploy worker and analyzed,
            returning a documentation to your browser.
          </p>
          <p>
            If you need some inspiration, you can click through to see some
            examples:
            <DocLinks>
              {"https://deno.land/std/fmt/colors.ts"}
              {"https://deno.land/x/oak/mod.ts"}
              {"https://deno.land/x/zod/mod.ts"}
            </DocLinks>
          </p>
          <p>
            There are a few built-in libraries that you can get documentation
            for:
            <ul class={gtw("list")}>
              <li>
                <a class={gtw("link")} href="/deno//stable">
                  Deno Built-In Library
                </a>
              </li>
              <li>
                <a class={gtw("link")} href="/deno//unstable">
                  Deno Unstable Built-In Library
                </a>
              </li>
              <li>
                <a class={gtw("link")} href="/deno//esnext">
                  ESNext Library
                </a>
              </li>
              <li>
                <a class={gtw("link")} href="/deno//dom">
                  DOM Library
                </a>
              </li>
            </ul>
          </p>
          <p>
            The source for this web application is available{" "}
            <a
              class={gtw("url")}
              href="https://github.com/kitsonk/deploy_doc"
              target="_blank"
            >
              https://github.com/kitsonk/deploy_doc
            </a>{" "}
            and you can{" "}
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
              Deploy It...
            </a>{" "}
            yourself if you wish.
          </p>
        </div>
        <div class={tw`grid grid-cols-1 sm:grid-cols-7 mt-4 gap-4`}>
          <div
            class={tw
              `relative text-gray-500 focus-within:text-gray-700 sm:col-span-6`}
          >
            <label
              for="url"
              class={tw
                `absolute z-10 ml-4 mt-0.5 px-1.5 tracking-wider bg-white text-gray-400 font-medium text-sm transition`}
            >
              URL to Document
            </label>
            <div class={tw`pt-3`}>
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
              <button
                class={tw
                  `transition inline-block focus-visible:ring-2 focus-visible:ring-black focus:outline-none py-2.5 px-6 text-base text-gray-600 font-medium rounded-lg hover:shadow-lg`}
                style="background: linear-gradient(279.56deg, rgb(238, 255, 245) -52.57%, rgb(186, 233, 239) 126.35%);"
                type="submit"
              >
                Document
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
