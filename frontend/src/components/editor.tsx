import { useEffect, useRef, useState } from "react";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

export function Editor(props: Props) {
  const [innerText, setInnerText] = useState(props.value ?? "");
  const [textContent, setTextContent] = useState<string | null>(innerText);
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
    const el = contentEditableRef.current;

    if (el) {
      if (innerText.length > 0) {
        el.innerHTML = innerText;
      }

      el.focus();
      restoreCursorPosition(contentEditableRef.current, { start: innerText.length, end: innerText.length });
    }

    return () => {
      setInnerText(props.value ?? "");
      setTextContent(innerText);
    };
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

type CursorPosition = {
  start: number;
  end: number;
};

function restoreCursorPosition(el: HTMLElement, positions: CursorPosition | null) {
  if (!positions) return;

  function createRange(node: Node, chars: { count: number }): { node: Node; offset: number } | null {
    if (!node || chars.count === 0) return { node, offset: 0 };

    if (node.nodeType === Node.TEXT_NODE) {
      const length = node.textContent?.length || 0;

      if (chars.count <= length) {
        return { node, offset: chars.count };
      } else {
        chars.count -= length;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (let i = 0; i < node.childNodes.length; i++) {
        const result = createRange(node.childNodes[i], chars);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  function setCursorPosition(el: HTMLElement, cursorPosition: CursorPosition) {
    const selection = window.getSelection();

    if (!selection) return;

    const start = createRange(el, { count: cursorPosition.start });
    const end = createRange(el, { count: cursorPosition.end });

    if (start && end) {
      const range = document.createRange();
      range.setStart(start.node, start.offset);
      range.setEnd(end.node, end.offset);

      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  setCursorPosition(el, positions);
}
