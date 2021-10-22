/** @jsx h */
import { h, tw } from "../deps.ts";
import type {
  ObjectPatPropAssignDef,
  ObjectPatPropDef,
  ObjectPatPropKeyValueDef,
  ObjectPatPropRestDef,
  ParamArrayDef,
  ParamAssignDef,
  ParamDef,
  ParamIdentifierDef,
  ParamObjectDef,
  ParamRestDef,
} from "../deps.ts";
import { TypeDef } from "./types.tsx";

interface ParamProps<P extends ParamDef> {
  item: P;
  optional?: boolean;
}

function Param({ item, optional }: ParamProps<ParamDef>) {
  switch (item.kind) {
    case "array":
      return <ParamArray item={item} optional={optional} />;
    case "assign":
      return <ParamAssign item={item} />;
    case "identifier":
      return <ParamIdentifier item={item} optional={optional} />;
    case "object":
      return <ParamObject item={item} optional={optional} />;
    case "rest":
      return <ParamRest item={item} />;
  }
}

function ParamArray({ item, optional }: ParamProps<ParamArrayDef>) {
  return (
    <span>
      [{item.elements.map((e, i) =>
        e && <Param item={e} />
      )}]{item.optional || optional ? "?" : ""}
      {item.tsType && (
        <span>
          : <TypeDef def={item.tsType} inline />
        </span>
      )}
    </span>
  );
}

function ParamAssign({ item }: ParamProps<ParamAssignDef>) {
  return (
    <span>
      <Param item={item.left} optional />
      {item.tsType &&
        <TypeDef def={item.tsType} inline />}
    </span>
  );
}

function ParamIdentifier({ item, optional }: ParamProps<ParamIdentifierDef>) {
  return (
    <span>
      {item.name}
      {item.optional || optional ? "?" : ""}
      {item.tsType && (
        <span>
          : <TypeDef def={item.tsType} inline />
        </span>
      )}
    </span>
  );
}

interface ObjectPatProps<I extends ObjectPatPropDef> {
  item: I;
}

function ObjectPat({ item }: ObjectPatProps<ObjectPatPropDef>) {
  switch (item.kind) {
    case "assign":
      return <ObjectAssignPat item={item} />;
    case "keyValue":
      return <ObjectKeyValuePat item={item} />;
    case "rest":
      return <ObjectRestPat item={item} />;
  }
}

function ObjectAssignPat({ item }: ObjectPatProps<ObjectPatPropAssignDef>) {
  return (
    <span>
      {item.key}
      {item.value && item.value !== "[UNSUPPORTED]"
        ? `= ${item.value}`
        : undefined}
    </span>
  );
}

function ObjectKeyValuePat({ item }: ObjectPatProps<ObjectPatPropKeyValueDef>) {
  return (
    <span>
      {item.key}: <Param item={item.value} />
    </span>
  );
}

function ObjectRestPat({ item }: ObjectPatProps<ObjectPatPropRestDef>) {
  return (
    <span>
      ...<Param item={item.arg} />
    </span>
  );
}

function ParamObject({ item, optional }: ParamProps<ParamObjectDef>) {
  const props = [];
  for (let i = 0; i < item.props.length; i++) {
    props.push(<ObjectPat item={item.props[i]} />);
    if (i < item.props.length - 1) {
      props.push(<span>,{" "}</span>);
    }
  }
  return (
    <span>
      &#123; {props} &#125;
      {item.optional || optional ? "?" : ""}
      {item.tsType && (
        <span>
          : <TypeDef def={item.tsType} inline />
        </span>
      )}
    </span>
  );
}

function ParamRest({ item }: ParamProps<ParamRestDef>) {
  return (
    <span>
      ...<Param item={item.arg} />
      {item.tsType && (
        <span>
          : <TypeDef def={item.tsType} inline />
        </span>
      )}
    </span>
  );
}

export function Params(
  { params, inline }: { params: ParamDef[]; inline?: boolean },
) {
  if (!params.length) {
    return;
  }

  if (params.length < 3 || inline) {
    const children = [];
    for (let i = 0; i < params.length; i++) {
      children.push(<Param item={params[i]} />);
      if (i < params.length - 1) {
        children.push(<span>,{" "}</span>);
      }
    }
    return children;
  }
  return params.map((p) => (
    <div class={tw`ml-4`}>
      <Param item={p} />
    </div>
  ));
}
