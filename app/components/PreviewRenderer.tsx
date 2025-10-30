"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import EditableText from "./EditableText";

type PreviewRendererProps = {
  code: string;
  values: Record<string, string>;
  setValue: (id: string, v: string) => void;
};

export default function PreviewRenderer({ code, values, setValue }: PreviewRendererProps) {
  // Keep a stable reference for `values` to avoid remounting preview on each keystroke
  const stableValuesRef = useRef<Record<string, string>>({});
  useEffect(() => {
    const target = stableValuesRef.current;
    // copy/merge keys
    for (const k of Object.keys(values)) {
      target[k] = values[k];
    }
    // remove keys not present anymore
    for (const k of Object.keys(target)) {
      if (!(k in values)) delete target[k];
    }
  }, [values]);

  const scope = useMemo(() => ({
    React,
    EditableText,
    values: stableValuesRef.current,
    setValue,
    Fragment: React.Fragment,
  }), [setValue]);

  // Transform user code for noInline mode:
  // 1) Strip `export default` from `export default function Template`.
  // 2) Append explicit render call.
  const transformed = useMemo(() => {
    let src = code;
    let componentName = "Template";

    // Case 1: export default function Name
    const fnMatch = src.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
    if (fnMatch) {
      componentName = fnMatch[1];
      src = src.replace(/export\s+default\s+function\s+/m, "function ");
    } else {
      // Case 2: export default class Name
      const classMatch = src.match(/export\s+default\s+class\s+([A-Za-z0-9_]+)/);
      if (classMatch) {
        componentName = classMatch[1];
        src = src.replace(/export\s+default\s+class\s+/m, "class ");
      } else {
        // Case 3: export default Identifier;
        const idMatch = src.match(/export\s+default\s+([A-Za-z0-9_]+)\s*;?/);
        if (idMatch) {
          componentName = idMatch[1];
          src = src.replace(/export\s+default\s+([A-Za-z0-9_]+)\s*;?/m, "");
        }
      }
    }

    return `${src}\n\nrender(<${componentName} values={values} setValue={setValue} />);`;
  }, [code]);

  return (
    <div className="w-full">
      <LiveProvider code={transformed} scope={scope} noInline>
        <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <LivePreview />
        </div>
        <div className="mt-3 text-sm text-red-600 font-mono">
          <LiveError />
        </div>
      </LiveProvider>
    </div>
  );
}


