/** @jsx h */
import { h } from "../deps.ts";
import type {
  Accessibility as AccessibilityType,
  ClassConstructorDef,
  ClassMethodDef,
  ClassPropertyDef,
  DocNodeClass,
  TsTypeDef,
} from "../deps.ts";
import { getState, setState, STYLE_OVERRIDE } from "../shared.ts";
import { assert, take } from "../util.ts";
import {
  Anchor,
  DocTitle,
  Markdown,
  SectionTitle,
  SourceLink,
  TARGET_RE,
} from "./common.tsx";
import type { DocProps } from "./common.tsx";
import { IndexSignatures, IndexSignaturesDoc } from "./interfaces.tsx";
import { Params } from "./params.tsx";
import { codeBlockStyles, gtw, largeMarkdownStyles } from "./styles.ts";
import { TypeArguments, TypeDef, TypeParams } from "./types.tsx";

type ClassAccessorDef = ClassMethodDef & { kind: "getter" | "setter" };
type ClassGetterDef = ClassMethodDef & { kind: "getter" };
type ClassSetterDef = ClassMethodDef & { kind: "setter" };
type ClassItemType = "prop" | "method" | "static_prop" | "static_method";
type ClassItemDef = ClassMethodDef | ClassPropertyDef;

function compareAccessibility(
  a: ClassPropertyDef | ClassMethodDef,
  b: ClassPropertyDef | ClassMethodDef,
): number {
  if (a.accessibility !== b.accessibility) {
    if (a.accessibility === "private") {
      return -1;
    }
    if (b.accessibility === "private") {
      return 1;
    }
    if (a.accessibility === "protected") {
      return -1;
    }
    if (b.accessibility === "protected") {
      return 1;
    }
  }
  if (a.name === b.name && isClassAccessor(a) && isClassAccessor(b)) {
    return a.kind === "getter" ? -1 : 1;
  }
  if (a.name.startsWith("[") && b.name.startsWith("[")) {
    return a.name.localeCompare(b.name);
  }
  if (a.name.startsWith("[")) {
    return 1;
  }
  if (b.name.startsWith("[")) {
    return -1;
  }
  return a.name.localeCompare(b.name);
}

function isClassMethod(
  value: ClassPropertyDef | ClassMethodDef,
): value is ClassMethodDef & { kind: "method" } {
  return "kind" in value && value.kind === "method";
}

function isClassAccessor(
  value: ClassPropertyDef | ClassMethodDef,
): value is ClassAccessorDef {
  return "kind" in value &&
    (value.kind === "getter" || value.kind === "setter");
}

function isClassGetter(
  value: ClassPropertyDef | ClassMethodDef,
): value is ClassGetterDef {
  return "kind" in value && value.kind === "getter";
}

function isClassSetter(
  value: ClassPropertyDef | ClassMethodDef,
): value is ClassSetterDef {
  return "kind" in value && value.kind === "setter";
}

function isClassProperty(
  value: ClassPropertyDef | ClassMethodDef,
): value is ClassPropertyDef {
  return "readonly" in value;
}

function getClassItemType(
  item: ClassPropertyDef | ClassMethodDef,
): ClassItemType {
  if (item.isStatic) {
    return isClassProperty(item) || isClassAccessor(item)
      ? "static_prop"
      : "static_method";
  } else {
    return isClassProperty(item) || isClassAccessor(item) ? "prop" : "method";
  }
}

function getClassItemLabel(type: ClassItemType) {
  switch (type) {
    case "method":
      return "Instance methods";
    case "prop":
      return "Instance properties";
    case "static_method":
      return "Static methods";
    case "static_prop":
      return "Static properties";
  }
}

function Accessibility(
  { children }: {
    children:
      | (AccessibilityType | undefined)
      | (AccessibilityType | undefined)[];
  },
) {
  const accessibility = take(children);
  const so = getState(STYLE_OVERRIDE);
  return accessibility && (
    <span class={gtw("keyword", so)}>{accessibility}</span>
  );
}

function ClassAccessorDoc(
  { get, set }: { get?: ClassGetterDef; set?: ClassSetterDef },
) {
  const name = (get ?? set)?.name;
  assert(name);
  const target = name.replaceAll(TARGET_RE, "_");
  const tsType = get?.functionDef.returnType ??
    (set?.functionDef.params[0])?.tsType;
  const jsDoc = get?.jsDoc ?? set?.jsDoc;
  const location = get?.location ?? set?.location;
  assert(location);
  return (
    <div class={gtw("docItem")} id={target}>
      <Anchor>{target}</Anchor>
      <div class={gtw("docEntry")}>
        <SourceLink>{location}</SourceLink>
        {name}
        {tsType && (
          <span>
            : <TypeDef inline>{tsType}</TypeDef>
          </span>
        )}
        <Markdown style={largeMarkdownStyles}>{jsDoc}</Markdown>
      </div>
    </div>
  );
}

function ClassCodeBlock(
  { children, items }: {
    children: DocNodeClass | DocNodeClass[];
    items: (ClassPropertyDef | ClassMethodDef)[];
  },
) {
  const {
    name,
    classDef: {
      isAbstract,
      typeParams,
      extends: ext,
      superTypeParams,
      implements: impl,
      constructors,
      indexSignatures,
    },
  } = take(children);
  const hasElements =
    !!(constructors.length || indexSignatures.length || items.length);
  const prev = getState(STYLE_OVERRIDE);
  setState(STYLE_OVERRIDE, codeBlockStyles);
  const keyword = gtw("keyword", codeBlockStyles);
  const codeBlock = (
    <div class={gtw("code")}>
      <span class={keyword}>
        {isAbstract ? "abstract " : ""}class
      </span>{" "}
      {name}
      <TypeParams>{typeParams}</TypeParams>
      {ext && (
        <span>
          <span class={keyword}>{" "}extends{" "}</span>
          {ext}
          <TypeArguments>{superTypeParams}</TypeArguments>
        </span>
      )}
      <Implements>{impl}</Implements> &#123;
      {hasElements
        ? (
          <div class={gtw("classBody", codeBlockStyles)}>
            <Constructors>{constructors}</Constructors>
            <IndexSignatures>{indexSignatures}</IndexSignatures>
            <ClassItems>{items}</ClassItems>
          </div>
        )
        : " "}&#125;
    </div>
  );
  setState(STYLE_OVERRIDE, prev);
  return codeBlock;
}

function ClassItems(
  { children }: { children: ClassItemDef[] | [ClassItemDef[]] },
) {
  const defs = take<ClassItemDef[]>(children);
  if (!defs.length) {
    return;
  }
  const items = [];
  let prev: ClassItemType | undefined;
  for (let i = 0; i < defs.length; i++) {
    const def = defs[i];
    const curr = getClassItemType(def);
    if (prev && prev !== curr) {
      items.push(<div>&nbsp;</div>);
    }
    prev = curr;
    if (isClassMethod(def) || isClassAccessor(def)) {
      items.push(<ClassMethod>{def}</ClassMethod>);
    } else {
      assert(isClassProperty(def));
      items.push(<ClassProperty>{def}</ClassProperty>);
    }
  }
  const so = getState(STYLE_OVERRIDE);
  return <div class={gtw("indent", so)}>{items}</div>;
}

function ClassItemsDoc(
  { children }: { children: ClassItemDef[] | [ClassItemDef[]] },
) {
  const defs = take<ClassItemDef[]>(children);
  if (!defs.length) {
    return;
  }
  const items = [];
  let prev: ClassItemType | undefined;
  for (let i = 0; i < defs.length; i++) {
    const def = defs[i];
    const curr = getClassItemType(def);
    if (curr !== prev) {
      items.push(<SectionTitle>{getClassItemLabel(curr)}</SectionTitle>);
    }
    prev = curr;
    if (isClassGetter(def)) {
      const next = defs[i + 1];
      if (next && isClassSetter(next) && def.name === next.name) {
        i++;
        items.push(<ClassAccessorDoc get={def} set={next} />);
      } else {
        items.push(<ClassAccessorDoc get={def} />);
      }
    } else if (isClassSetter(def)) {
      items.push(<ClassAccessorDoc set={def} />);
    } else if (isClassMethod(def)) {
      const methods = [def];
      let next;
      while (
        (next = items[i + 1]) && next && isClassMethod(next) &&
        def.name === next.name
      ) {
        i++;
        methods.push(next);
      }
      items.push(<ClassMethodDoc>{methods}</ClassMethodDoc>);
    } else {
      assert(isClassProperty(def));
      items.push(<ClassPropertyDoc>{def}</ClassPropertyDoc>);
    }
  }
  return items;
}

function ClassMethod(
  { children }: { children: ClassMethodDef | ClassMethodDef[] },
) {
  const {
    accessibility,
    isAbstract,
    isStatic,
    functionDef: { isAsync, isGenerator, typeParams, params, returnType },
    kind,
    name,
    optional,
  } = take(children);
  const so = getState(STYLE_OVERRIDE);
  const keyword = gtw("keyword", so);
  return (
    <div>
      {isStatic || accessibility || isAbstract
        ? (
          <span class={keyword}>
            {isStatic ? "static " : undefined}
            {accessibility && `${accessibility} `}
            {isAbstract ? "abstract " : undefined}
          </span>
        )
        : undefined}
      {isAsync || isGenerator || kind === "getter" || kind === "setter"
        ? (
          <span class={keyword}>
            {isAsync ? "async " : undefined}
            {kind === "getter"
              ? "get "
              : kind === "setter"
              ? "set "
              : undefined}
            {isGenerator ? "*" : undefined}
          </span>
        )
        : undefined}
      <span
        class={kind === "method" && !name.startsWith("[")
          ? gtw("classMethod", so) : undefined}
      >
        {name}
      </span>
      {optional ? "?" : ""}
      <TypeParams>{typeParams}</TypeParams>(<Params>{params}
      </Params>){returnType && (
        <span>
          : <TypeDef inline>{returnType}</TypeDef>
        </span>
      )};
    </div>
  );
}

function ClassMethodDoc(
  { children }: { children: ClassMethodDef[] | [ClassMethodDef[]] },
) {
  const methods = take<ClassMethodDef[]>(children);
  const target = methods[0].name.replaceAll(TARGET_RE, "_");
  return (
    <div class={gtw("docItem")} id={target}>
      <Anchor>{target}</Anchor>
      {methods.map((
        {
          location,
          name,
          jsDoc,
          functionDef: { typeParams, params, returnType },
        },
      ) => (
        <div class={gtw("docEntry")}>
          <SourceLink>{location}</SourceLink>
          {name}
          <TypeParams>{typeParams}</TypeParams>(<Params inline>{params}
          </Params>){returnType && (
            <span>
              : <TypeDef>{returnType}</TypeDef>
            </span>
          )}
          <Markdown style={largeMarkdownStyles}>{jsDoc}</Markdown>
        </div>
      ))}
    </div>
  );
}

function ClassProperty(
  { children }: { children: ClassPropertyDef | ClassPropertyDef[] },
) {
  const {
    isStatic,
    accessibility,
    isAbstract,
    readonly,
    name,
    optional,
    tsType,
  } = take(children);
  const so = getState(STYLE_OVERRIDE);
  return (
    <div>
      {isStatic || accessibility || isAbstract || readonly
        ? (
          <span class={gtw("keyword", so)}>
            {isStatic ? "static " : undefined}
            {accessibility && `${accessibility} `}
            {isAbstract ? "abstract " : undefined}
            {readonly ? "readonly " : undefined}
          </span>
        )
        : undefined}
      <span>{name}</span>
      {optional ? "?" : ""}
      {tsType
        ? (
          <span>
            : <TypeDef terminate>{tsType}</TypeDef>
          </span>
        )
        : ";"}
    </div>
  );
}

function ClassPropertyDoc(
  { children }: { children: ClassPropertyDef | [ClassPropertyDef] },
) {
  const { location, name, tsType, jsDoc } = take(children);
  const target = name.replaceAll(TARGET_RE, "_");
  return (
    <div class={gtw("docItem")} id={target}>
      <Anchor>{target}</Anchor>
      <div class={gtw("docEntry")}>
        <SourceLink>{location}</SourceLink>
        {name}
        {tsType && (
          <span>
            : <TypeDef inline>{tsType}</TypeDef>
          </span>
        )}
        <Markdown style={largeMarkdownStyles}>{jsDoc}</Markdown>
      </div>
    </div>
  );
}

function Constructors(
  { children }: { children: ClassConstructorDef[] | ClassConstructorDef[][] },
) {
  const ctors = take<ClassConstructorDef[]>(children, true);
  if (!ctors.length) {
    return;
  }
  const so = getState(STYLE_OVERRIDE);
  const items = ctors.map(({ accessibility, name, params }) => (
    <div>
      <Accessibility>{accessibility}</Accessibility>
      <span class={gtw("keyword", so)}>{name}</span>(<Params>{params}</Params>);
    </div>
  ));
}

function ConstructorsDoc(
  { children, name }: {
    children: ClassConstructorDef[] | [ClassConstructorDef[]];
    name: string;
  },
) {
  const ctors = take<ClassConstructorDef[]>(children, true);
  if (!ctors.length) {
    return;
  }
  const items = ctors.map(({ location, params, jsDoc }) => (
    <div class={gtw("docEntry")}>
      <SourceLink>{location}</SourceLink>
      <span class={gtw("bold")}>new{" "}</span>
      {name}(<Params inline>{params}</Params>);
      <Markdown style={largeMarkdownStyles}>{jsDoc}</Markdown>
    </div>
  ));
  return (
    <div>
      <SectionTitle>Constructors</SectionTitle>
      {items}
    </div>
  );
}

function Implements({ children }: { children: TsTypeDef[] | TsTypeDef[][] }) {
  const types = take<TsTypeDef[]>(children, true);
  const so = getState(STYLE_OVERRIDE);
  if (!types.length) {
    return;
  }
  const items = [];
  for (let i = 0; i < types.length; i++) {
    items.push(<TypeDef>{types[i]}</TypeDef>);
    if (i < types.length - 1) {
      items.push(<span>,{" "}</span>);
    }
  }
  return (
    <span>
      {" "}
      <span class={gtw("keyword", so)}>implements{" "}</span>
      {items}
    </span>
  );
}

export function ClassDoc({ children, path }: DocProps<DocNodeClass>) {
  const node = take(children);
  const items = [...node.classDef.properties, ...node.classDef.methods].sort(
    (a, b) => {
      if (a.isStatic !== b.isStatic) {
        return a.isStatic ? 1 : -1;
      }
      if (
        (isClassProperty(a) && isClassProperty(b)) ||
        (isClassProperty(a) && isClassAccessor(b)) ||
        (isClassAccessor(a) && isClassProperty(b)) ||
        (isClassMethod(a) && isClassMethod(b))
      ) {
        return compareAccessibility(a, b);
      }
      if (isClassAccessor(a) && !isClassAccessor(b)) {
        return -1;
      }
      if (isClassAccessor(b)) {
        return 1;
      }
      return isClassProperty(a) ? -1 : 1;
    },
  );
  return (
    <div class={gtw("mainBox")}>
      <DocTitle path={path}>{node}</DocTitle>
      <Markdown style={largeMarkdownStyles}>{node.jsDoc}</Markdown>
      <ClassCodeBlock items={items}>{node}</ClassCodeBlock>
      <div class={gtw("docItems")}>
        <ConstructorsDoc name={node.name}>
          {node.classDef.constructors}
        </ConstructorsDoc>
        <IndexSignaturesDoc>{node.classDef.indexSignatures}</IndexSignaturesDoc>
        <ClassItemsDoc>{items}</ClassItemsDoc>
      </div>
    </div>
  );
}