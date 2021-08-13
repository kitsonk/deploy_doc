/** @jsx h */
import { Component, h, tw } from "../deps.ts";

interface Props {
  title: string;
  subtitle: string;
  children?: unknown;
}

export class Body extends Component<Props> {
  render() {
    return (
      <body class={tw`bg-gray-300`}>
        <div
          class={tw
            `max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto p-6`}
        >
          <div class={tw`clear-both mb-12`}>
            <img
              src="https://deno.land/images/deno_logo_4.gif"
              class={tw`h-16 mr-4 float-left`}
            />
            <h1 class={tw`h-10 text-3xl font-bold`}>{this.props.title}</h1>
            <h2 class={tw`h-6 text-xl font-semibold`}>{this.props.subtitle}</h2>
          </div>
          {this.props.children}
        </div>
      </body>
    );
  }
}
