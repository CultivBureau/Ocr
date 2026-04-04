"use client";

import React, { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";

type CodeEditorProps = {
  code: string;
  onChange: (next: string) => void;
  className?: string;
};

export default function CodeEditor({ code, onChange, className }: CodeEditorProps) {
  const extensions = useMemo(() => [javascript({ jsx: true, typescript: true })], []);

  return (
    <div className={className}>
      <CodeMirror
        value={code}
        height="70vh"
        theme={oneDark}
        extensions={extensions}
        basicSetup={{ lineNumbers: true, highlightActiveLine: true, foldGutter: true }}
        onChange={(value) => onChange(value)}
      />
    </div>
  );
}


