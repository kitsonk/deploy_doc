// Copyright 2021 the Deno authors. All rights reserved. MIT license.
/** @jsx h */
import { h } from "../deps.ts";
import { gtw } from "./styles.ts";

interface ErrorMessageProps {
  title: string;
  children: unknown;
}

export function ErrorMessage({ children, title }: ErrorMessageProps) {
  return (
    <div class={gtw("error")} role="alert">
      <p class={gtw("bold")}>{title}</p>
      <p>{children}</p>
    </div>
  );
}
