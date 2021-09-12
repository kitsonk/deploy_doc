/** @jsx h */
import { Component, h, tw } from "../deps.ts";

interface DocLinksProps {
  links: string[];
}

class DocLinks extends Component<DocLinksProps> {
  render() {
    const items = [];
    for (const child of this.props.links) {
      items.push(
        <li>
          <a
            class={tw`hover:text-blue-800`}
            href={`/${child.replace("://", "/")}`}
          >
            <code>{child}</code>
          </a>
        </li>,
      );
    }
    return <ul class={tw`text-sm list-disc list-inside ml-4`}>{items}</ul>;
  }
}

export class SpecifierForm extends Component {
  render() {
    return (
      <form
        action="/doc"
        method="get"
        class={tw`w-full bg-gray-50 rounded-lg`}
      >
        <div class={tw`w-full my-2 px-12 pt-12 space-y-6`}>
          <p>
            Deploy Doc utilizes the <code>deno_doc</code>{" "}
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
            <DocLinks
              links={[
                "https://deno.land/std/fmt/colors.ts",
                "https://deno.land/x/oak/mod.ts",
                "https://deno.land/x/zod/mod.ts",
              ]}
            />
          </p>
          <p>
            There are a few built-in libraries that you can get documentation
            for:
            <ul class={tw`text-sm list-disc list-inside ml-4`}>
              <li>
                <a class={tw`hover:text-blue-800`} href="/deno/stable">
                  Deno Built-In Library
                </a>
              </li>
              <li>
                <a class={tw`hover:text-blue-800`} href="/deno/unstable">
                  Deno Unstable Built-In Library
                </a>
              </li>
              <li>
                <a class={tw`hover:text-blue-800`} href="/deno/esnext">
                  ESNext Library
                </a>
              </li>
              <li>
                <a class={tw`hover:text-blue-800`} href="/deno/dom">
                  DOM Library
                </a>
              </li>
            </ul>
          </p>
          <p>
            The source for this web application is available{" "}
            <a
              class={tw`text-blue-800`}
              href="https://github.com/kitsonk/deploy_doc"
              target="_blank"
            >
              https://github.com/kitsonk/deploy_doc
            </a>{" "}
            and you can{" "}
            <a
              class={tw
                `bg-white text-sm text-gray-800 font-bold rounded border-b-2 border-green-500 hover:border-green-600 hover:bg-green-500 hover:text-white shadow-md py-2 px-4 inline-flex items-center focus:outline-none focus:ring-2 focus:ring-green-800 focus:ring-opacity-50`}
              href={`https://dash.deno.com/new?url=${
                encodeURIComponent(
                  "https://raw.githubusercontent.com/kitsonk/deploy_doc/main/main.ts",
                )
              }`}
              target="_blank"
            >
              Deploy It!
            </a>{" "}
            yourself if you wish.
          </p>
        </div>
        <div class={tw`px-12 py-10`}>
          <label for="url">Module specifier to document:</label>
          <div class={tw`relative w-full my-2`}>
            <span
              class={tw
                `absolute inset-y-0 left-0 flex items-center pl-2 text-gray-600`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class={tw`h-5 w-5`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="URL"
              name="url"
              id="url"
              class={tw
                `px-10 w-full border rounded py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent`}
            />
          </div>
          <button
            type="submit"
            class={tw
              `w-full py-2 rounded-full bg-green-600 text-gray-100 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-800 focus:ring-opacity-50`}
          >
            Graph...
          </button>
        </div>
      </form>
    );
  }
}
