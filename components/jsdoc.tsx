/** @jsx h */
import { comrak, h, tw } from "../deps.ts";
import type {
  JsDoc as JsDocNode,
  JsDocTag as JsDocTagNode,
  JsDocTagKind,
  JsDocTagNamed,
  JsDocTagParam,
  JsDocTagReturn,
  ParamDef,
  TsTypeParamDef,
} from "../deps.ts";
import { take } from "../util.ts";
import type { Child } from "../util.ts";
import { gtw, tagMarkdownStyles } from "./styles.ts";
import type { StyleOverride } from "./styles.ts";

type Color =
  | "black"
  | "white"
  | "gray"
  | "red"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "indigo"
  | "purple"
  | "pink";

interface DocParams {
  /** The JSDoc item to render. */
  children: Child<JsDocNode | undefined>;
  /** Overrides to the styling to apply. */
  style?: StyleOverride;
  /** An optional array of tags that if present in the JSDoc should be
   * rendered. */
  tags?: JsDocTagKind[];
}

await comrak.init();

/** Match up any `@param` tags in a JSDoc node to the passed parameters and
 * return the documentation. */
export function getParamDoc(
  params: ParamDef[],
  jsDoc?: JsDocNode,
): (string | undefined)[] {
  const docs = new Array(params.length);
  const tags = jsDoc?.tags?.filter(({ kind }) => kind === "param") as
    | JsDocTagParam[]
    | undefined;
  if (tags && tags.length) {
    const tagMap = new Map(tags.map((tag) => [tag.name, tag.doc]));
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      switch (param.kind) {
        case "array":
        case "assign":
        case "object":
          docs[i] = tagMap.get(`param${i}`);
          break;
        case "identifier":
          docs[i] = tagMap.get(param.name);
          break;
        case "rest":
          docs[i] = tagMap.get(
            param.arg.kind === "identifier" ? param.arg.name : `param${i}`,
          );
          break;
      }
    }
  }
  return docs;
}

/** Check a JSDoc node for any `@template` docs that match the name of the
 * type parameters and return them. */
export function getTypeParamDoc(
  typeParams: TsTypeParamDef[],
  jsDoc?: JsDocNode,
): (string | undefined)[] {
  const docs = new Array(typeParams.length);
  const tags = jsDoc?.tags?.filter(({ kind }) => kind === "template") as
    | JsDocTagNamed[]
    | undefined;
  if (tags && tags.length) {
    const tagMap = new Map(tags.map((tag) => [tag.name, tag.doc]));
    for (let i = 0; i < typeParams.length; i++) {
      const typeParam = typeParams[i];
      docs[i] = tagMap.get(typeParam.name);
    }
  }
  return docs;
}

/** Return any a documentation associated with the `@return`/`@returns` tag
 * in a JSDoc node. */
export function getReturnDoc(jsDoc?: JsDocNode): string | undefined {
  if (jsDoc && jsDoc.tags) {
    const returnTag = jsDoc.tags.find(({ kind }) =>
      kind === "return"
    ) as JsDocTagReturn;
    if (returnTag) {
      return returnTag.doc;
    }
  }
}

/** A component which renders a JSDoc. */
export function JsDoc({ children, style, tags }: DocParams) {
  const jsDoc = take(children);
  if (!jsDoc) {
    return;
  }
  const docTags = [];
  if (jsDoc.tags && tags) {
    for (const tag of jsDoc.tags) {
      if (tags.includes(tag.kind)) {
        docTags.push(<JsDocTag>{tag}</JsDocTag>);
      }
    }
  }
  return (
    <div>
      <Markdown style={style}>{jsDoc.doc}</Markdown>
      {docTags.length
        ? <div class={tw`text-sm mx-4`}>{docTags}</div>
        : undefined}
    </div>
  );
}

function JsDocTag({ children }: { children: Child<JsDocTagNode> }) {
  const tag = take(children);
  switch (tag.kind) {
    case "callback":
    case "param":
    case "property":
    case "template":
    case "typedef":
      return (
        <div>
          <div>
            <span class={tw`italic`}>@{tag.kind}</span>{" "}
            <span class={tw`font-medium`}>{tag.name}</span>
          </div>
          <Markdown style={tagMarkdownStyles}>{tag.doc}</Markdown>
        </div>
      );
    case "constructor":
    case "deprecated":
    case "module":
    case "private":
    case "protected":
    case "public":
    case "readonly":
      return (
        <div>
          <span class={tw`italic`}>@{tag.kind}</span>
        </div>
      );
    case "enum":
    case "return":
      return (
        <div>
          <div>
            <span class={tw`italic`}>@{tag.kind}</span>
          </div>
          <Markdown style={tagMarkdownStyles}>{tag.doc}</Markdown>
        </div>
      );
    case "extends":
    case "this":
    case "type":
      return (
        <div>
          <div>
            <span class={tw`italic`}>@{tag.kind}</span>{" "}
            <span class={tw`font-medium`}>{tag.type}</span>
          </div>
          <Markdown style={tagMarkdownStyles}>{tag.doc}</Markdown>
        </div>
      );
  }
}

export function Markdown(
  { children, style }: {
    children: Child<string | undefined>;
    style?: StyleOverride;
  },
) {
  const md = take(children);
  return md
    ? (
      <div class={gtw("markdown", style)}>
        {comrak.markdownToHTML(md, {
          extension: {
            autolink: true,
            descriptionLists: true,
            strikethrough: true,
            table: true,
            tagfilter: true,
          },
        })}
      </div>
    )
    : undefined;
}

export function Tag(
  { children, color = "gray" }: { children: unknown; color?: Color },
) {
  return (
    <span
      class={tw
        `px-2 inline-flex text-xs leading-5 font-semibold lowercase rounded-full bg-${color}-100 text-${color}-800`}
    >
      {children}
    </span>
  );
}
