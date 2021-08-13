/** @jsx h */
import { Component, h, tw } from "../deps.ts";

interface Props {
  title: string;
  children?: unknown;
}

export class ErrorMessage extends Component<Props> {
  render() {
    return (
      <div
        class={tw`bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-6`}
        role="alert"
      >
        <p class={tw`font-bold`}>{this.props.title}</p>
        <p>{this.props.children}</p>
      </div>
    );
  }
}
