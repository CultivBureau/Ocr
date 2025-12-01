"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type EditableTextProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

function sanitizePlainText(input: string): string {
  // Keep it simple: remove newlines and trim; no HTML allowed
  return input.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

export default function EditableText({ id, value, onChange, className, placeholder }: EditableTextProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [internal, setInternal] = useState<string>(value || "");
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    // Sync external changes, but don't disrupt caret if focused
    const isFocused = typeof document !== "undefined" && document.activeElement === ref.current;
    setInternal((prev) => (isFocused ? prev : (value || "")));
    if (!isFocused && ref.current && (ref.current.textContent || "") !== (value || "")) {
      ref.current.textContent = value || "";
    }
  }, [value]);

  const debouncedEmit = useMemo(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (text: string) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => onChange(text), 200);
    };
  }, [onChange]);

  const commit = useCallback(() => {
    if (!ref.current) return;
    const raw = ref.current.textContent || "";
    const clean = sanitizePlainText(raw);
    // Do not set state here to avoid rerender while typing (which reverses caret flow)
    debouncedEmit(clean);
  }, [debouncedEmit]);

  return (
    <span
      ref={ref}
      data-editable-id={id}
      role="textbox"
      aria-label={id}
      contentEditable
      suppressContentEditableWarning
      className={className}
      onInput={() => {
        if (isComposing) return;
        commit();
      }}
      onBlur={() => {
        // On blur, normalize DOM and sync internal state once
        if (!ref.current) return;
        const raw = ref.current.textContent || "";
        const clean = sanitizePlainText(raw);
        if (ref.current.textContent !== clean) ref.current.textContent = clean;
        setInternal(clean);
        debouncedEmit(clean);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          // Prevent newlines to keep layout tight, but do not force blur
          e.preventDefault();
        }
      }}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={() => {
        setIsComposing(false);
        commit();
      }}
    >
      {internal || placeholder || ""}
    </span>
  );
}


