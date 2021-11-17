/** @jsx h */
import { Component, h, tw } from "../deps.ts";
import { getStyle } from "./styles.ts";

interface Props {
  title: string;
  subtitle: string;
  children?: unknown;
}

export class Body extends Component<Props> {
  render() {
    return (
      <body class={tw`bg-gray-300`}>
        <div class={tw`${getStyle("main")}`}>
          <div class={tw`clear-both mb-12`}>
            <img
              src="https://deno.land/images/deno_logo_4.gif"
              class={tw`${getStyle("logo")}`}
              alt="Deno, a cute sauropod dinosaur, with animated rain."
            />
            <h1 class={tw`${getStyle("title")}`}>{this.props.title}</h1>
            <h2 class={tw`${getStyle("subtitle")}`}>{this.props.subtitle}</h2>
          </div>
          {this.props.children}
        </div>
      </body>
    );
  }
}
