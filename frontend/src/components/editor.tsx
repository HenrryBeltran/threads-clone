import { useEffect, useRef, useState } from "react";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

export function Editor(props: Props) {
  const [innerText, setInnerText] = useState(props.value ?? "");
  const [textContent, setTextContent] = useState(props.value ?? null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const highlightContentRef = useRef<HTMLDivElement>(null);

  function handleInput(e: React.FormEvent<HTMLDivElement>) {
    setInnerText(e.currentTarget.innerText);
    setTextContent(e.currentTarget.textContent);

    if (props.onChange) {
      props.onChange(e.currentTarget.innerText);
    }
  }

  function highlightText(text: string) {
    if (text.length === 0) {
      return "<br/>";
    }

    const hashtagPattern = /#(\w+)/g;
    const mentionPattern = /@(\w+)/g;

    const lines = text.split("\n");

    const highlightedLines = lines.map((line) => {
      const highlightedLine = line
        .replace(hashtagPattern, '<span class="text-blue-500 dark:text-blue-400" data-lexical-text="true">#$1</span>')
        .replace(mentionPattern, '<span class="text-blue-500 dark:text-blue-400" data-lexical-text="true">@$1</span>');

      const parts = highlightedLine.split(/(<span.*?<\/span>)/g);

      const wrappedParts = parts.map((part) => {
        if (part.match(/<span.*?<\/span>/)) {
          return part;
        }
        return part ? `<span data-lexical-text="true">${part}</span>` : "";
      });

      return wrappedParts.join("");
    });

    const result = highlightedLines.join("<br>");

    return result;
  }

  useEffect(() => {
    if (contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (highlightContentRef.current) {
      const el = highlightContentRef.current;

      el.innerHTML = highlightText(innerText);
    }
  }, [innerText]);

  return (
    <div className="relative">
      <div
        ref={contentEditableRef}
        contentEditable
        suppressContentEditableWarning={true}
        onInput={handleInput}
        className="break-words text-transparent caret-foreground outline-none"
      >
        {/* TODO: fix the mentions are getting eraser */}
        <br />
      </div>
      {(textContent === null || textContent.length === 0) && (
        <div className="pointer-events-none absolute top-0 text-muted-foreground">Start a thread...</div>
      )}
      <div
        ref={highlightContentRef}
        className="pointer-events-none absolute top-0 w-full select-none break-words outline-none"
      >
        <br />
      </div>
    </div>
  );
}
