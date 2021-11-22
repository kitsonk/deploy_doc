/** @jsx h */
import { h } from "../deps.ts";
import { gtw } from "./styles.ts";

interface BodyProps {
  title: string;
  subtitle: string;
  children?: unknown;
}

export function Body({ title, subtitle, children }: BodyProps) {
  return (
    <body class={gtw("body")}>
      <div class={gtw("main")}>
        <div class={gtw("mainHeader")}>
          <img
            src="https://deno.land/images/deno_logo_4.gif"
            class={gtw("logo")}
            alt="Deno, a cute sauropod dinosaur, with animated rain."
          />
          <h1 class={gtw("title")}>{title}</h1>
          <h2 class={gtw("subtitle")}>{subtitle}</h2>
        </div>
        {children}
      </div>
    </body>
  );
}
