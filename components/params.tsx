/** @jsx h */
import { h, tw } from "../deps.ts";
import type {
  ParamArrayDef,
  ParamAssignDef,
  ParamDef,
  ParamIdentifierDef,
  ParamObjectDef,
  ParamRestDef,
} from "../deps.ts";
import { TypeDef } from "./types.tsx";

interface ParamProps<P extends ParamDef> {
  index?: string;
  item: P;
  optional?: boolean;
}

function Param({ item, optional, index }: ParamProps<ParamDef>) {
  switch (item.kind) {
    case "array":
      return <ParamArray item={item} optional={optional} index={index} />;
    case "assign":
      return <ParamAssign item={item} index={index} />;
    case "identifier":
      return <ParamIdentifier item={item} optional={optional} index={index} />;
    case "object":
      return <ParamObject item={item} optional={optional} index={index} />;
    case "rest":
      return <ParamRest item={item} index={index} />;
  }
}

function ParamArray({ item, optional, index }: ParamProps<ParamArrayDef>) {
  return (
    <span>
      [{item.elements.map((e, i) =>
        e && <Param item={e} index={`${index}${i}`} />
      )}]{item.optional || optional ? "?" : ""}
      {item.tsType && (
        <span>
          : <TypeDef def={item.tsType} inline />
        </span>
      )}
    </span>
  );
}

function ParamAssign({ item, index }: ParamProps<ParamAssignDef>) {
  return (
    <span>
      <Param item={item.left} optional index={index} />
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

function ParamObject({ item, optional, index }: ParamProps<ParamObjectDef>) {
  return (
    <span>
      {`param${index}`}
      {item.optional || optional ? "?" : ""}
      {item.tsType && (
        <span>
          : <TypeDef def={item.tsType} inline />
        </span>
      )}
    </span>
  );
}

function ParamRest({ item, index }: ParamProps<ParamRestDef>) {
  return (
    <span>
      ...<Param item={item.arg} index={index} />
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
      children.push(<Param item={params[i]} index={String(i)} />);
      if (i < params.length - 1) {
        children.push(<span>,{" "}</span>);
      }
    }
    return children;
  }
  return params.map((p, i) => (
    <div class={tw`ml-4`}>
      <Param item={p} index={String(i)} />
    </div>
  ));
}
