import { useThreadStore } from "@/store";
import { useEffect, useRef } from "react";

type Props = {
  index: number;
  placeholder?: string;
};

export function Editor(props: Props) {
  const thread = useThreadStore((state) => state.thread);
  const editTextFromThread = useThreadStore((state) => state.editTextFromThread);
  const changeCurrentIndexTo = useThreadStore((state) => state.changeCurrentIndexTo);

  const contentEditableRef = useRef<HTMLTextAreaElement>(null);
  const highlightContentRef = useRef<HTMLDivElement>(null);

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    e.currentTarget.style.height = "5px";
    e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";

    editTextFromThread(props.index, e.currentTarget.value);
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
    if (thread[props.index].text.length > 0) {
      contentEditableRef.current?.setSelectionRange(
        contentEditableRef.current.value.length,
        contentEditableRef.current.value.length,
      );
    }
  }, []);

  useEffect(() => {
    if (highlightContentRef.current) {
      const el = highlightContentRef.current;

      el.innerHTML = highlightText(thread[props.index].text);
    }
  }, [thread[props.index].text]);

  return (
    <div className="relative">
      <textarea
        ref={contentEditableRef}
        rows={1}
        autoFocus={true}
        value={thread[props.index].text}
        className="min-h-6 w-full max-w-full resize-none overflow-hidden break-words bg-transparent leading-snug text-transparent caret-foreground outline-none"
        onInput={handleInput}
        onFocus={() => changeCurrentIndexTo(props.index)}
      />
      {thread[props.index].text.length === 0 && (
        <div className="pointer-events-none absolute top-0 text-muted-foreground">
          {props.placeholder ? props.placeholder : "Start a thread..."}
        </div>
      )}
      <div
        ref={highlightContentRef}
        className="pointer-events-none absolute top-0 w-full select-none whitespace-pre-wrap break-words leading-snug outline-none"
      >
        <br />
      </div>
    </div>
  );
}
