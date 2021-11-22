/** @jsx h */
import { h } from "../deps.ts";
import type {
  ClassIndexSignatureDef,
  InterfaceIndexSignatureDef,
  LiteralIndexSignatureDef,
} from "../deps.ts";
import { getState, STYLE_OVERRIDE } from "../shared.ts";
import { take } from "../util.ts";
import { SectionTitle } from "./common.tsx";
import { Params } from "./params.tsx";
import { gtw } from "./styles.ts";
import { TypeDef } from "./types.tsx";

type IndexSignatureDef =
  | ClassIndexSignatureDef
  | InterfaceIndexSignatureDef
  | LiteralIndexSignatureDef;

export function IndexSignatures(
  { children }: { children: IndexSignatureDef[] | IndexSignatureDef[][] },
) {
  const signatures = take<IndexSignatureDef[]>(children);
  if (!signatures.length) {
    return;
  }
  const so = getState(STYLE_OVERRIDE);
  const items = signatures.map(({ params, readonly, tsType }) => (
    <div>
      {readonly
        ? <span class={gtw("keyword", so)}>readonly{" "}</span>
        : undefined}[<Params>{params}</Params>]{tsType && (
        <span>
          : <TypeDef inline>{tsType}</TypeDef>
        </span>
      )};
    </div>
  ));
  return <div class={gtw("indent", so)}>{items}</div>;
}

export function IndexSignaturesDoc(
  { children }: { children: IndexSignatureDef[] | [IndexSignatureDef[]] },
) {
  const signatures = take<IndexSignatureDef[]>(children);
  if (!signatures.length) {
    return;
  }
  const items = signatures.map(({ readonly, params, tsType }) => (
    <div>
      {readonly
        ? <span class={gtw("keyword")}>readonly{" "}</span>
        : undefined}[<Params>{params}</Params>]{tsType && (
        <span>
          : <TypeDef inline>{tsType}</TypeDef>
        </span>
      )}
    </div>
  ));
  return (
    <div>
      <SectionTitle>Index Signatures</SectionTitle>
      {items}
    </div>
  );
}
