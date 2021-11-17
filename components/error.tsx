/** @jsx h */
import { Component, h, tw } from "../deps.ts";
import { getStyle } from "./styles.ts";

interface Props {
  title: string;
  children?: unknown;
}

export class ErrorMessage extends Component<Props> {
  render() {
    return (
      <div class={tw`${getStyle("error")}`} role="alert">
        <p class={tw`font-bold`}>{this.props.title}</p>
        <p>{this.props.children}</p>
      </div>
    );
  }
}
