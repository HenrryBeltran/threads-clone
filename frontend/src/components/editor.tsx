import { useEffect, useRef, useState } from "react";

type CursorPosition = {
  start: number;
  end: number;
};

const initialHTMLLine = '<p class="whitespace-pre-wrap"><br/></p>';

export function Editor() {
  const [htmlContent, setHtmlContent] = useState<string>(initialHTMLLine);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const element = e.currentTarget;
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);

    if (!range) return;

    if (e.key === "Enter") {
      e.preventDefault();

      const br = document.createElement("br");

      const containerIsBR = range.commonAncestorContainer.nodeName === "BR";

      if (!containerIsBR) {
        range.insertNode(br);
      }

      if (
        br.previousSibling?.nodeType === Node.TEXT_NODE &&
        (!br.nextSibling?.nodeValue || br.nextSibling?.nodeValue.length < 1)
      ) {
        const extraBr = document.createElement("br");
        br.after(extraBr);
        selection?.setPosition(extraBr);
      } else if (containerIsBR) {
        (range.commonAncestorContainer as Element).after(br);
        selection?.setPosition(br);
      } else {
        selection?.setPosition(br.nextSibling);
      }
    }

    if (e.key === "Backspace") {
      const parent = selectCursorParent();

      if (parent?.textContent?.length === 1) {
        e.preventDefault();
        parent.innerHTML = "<br/>";
      }

      if (element.textContent === "" && element.children.length === 1) {
        holdAnEmptyLine();
      }

      if (e.metaKey || (e.altKey && element.textContent && element.textContent.split(" ").length < 2)) {
        holdAnEmptyLine();
      }
    }

    function holdAnEmptyLine() {
      e.preventDefault();
      e.currentTarget.innerHTML = initialHTMLLine;
      selection?.setPosition(element.children[0] as HTMLElement);
    }
  }

  function handleInput(e: React.FormEvent<HTMLDivElement>) {
    const value = e.currentTarget.innerHTML;
    setHtmlContent(value);
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
    if (contentEditableRef.current) {
      const el = contentEditableRef.current;
      const p = el.childNodes[0] as HTMLElement;
      const cursorPosition = saveCursorPosition(el);

      p.innerHTML = highlightText(p.innerText || p.textContent || "");

      restoreCursorPosition(el, cursorPosition);
    }
  }, [htmlContent]);

  return (
    <div
      ref={contentEditableRef}
      contentEditable
      suppressContentEditableWarning={true}
      onKeyDown={handleKeyDown}
      onInput={handleInput}
      className="h-full w-full border border-gray-300 outline-none"
    >
      <p className="whitespace-pre-wrap">
        <br />
      </p>
    </div>
  );
}

function selectCursorParent() {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  let element = range.startContainer as HTMLElement;

  if (element.nodeType === Node.TEXT_NODE) {
    element = element.parentElement as HTMLElement;
  }

  if (element.tagName === "DIV") {
    element = element.children[0] as HTMLElement;
  }

  return element;
}

const saveCursorPosition = (el: HTMLElement): CursorPosition | null => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(el);
  preCaretRange.setEnd(range.startContainer, range.startOffset);

  const start = preCaretRange.toString().length;

  return {
    start,
    end: start + range.toString().length,
  };
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

// import { useEffect, useRef, useState } from "react";
//
// type CursorPosition = {
//   start: number;
//   end: number;
// };
//
// const initialHTMLLine = '<p class="whitespace-pre-wrap"><br/></p>';
//
// export function Editor() {
//   const [htmlContent, setHtmlContent] = useState<string>(initialHTMLLine);
//   const contentEditableRef = useRef<HTMLDivElement>(null);
//
//   function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
//     const element = e.currentTarget;
//     const selection = window.getSelection();
//     const range = selection?.getRangeAt(0);
//
//     if (range === null || range === undefined) return;
//
//     if (e.key === "Enter") {
//       e.preventDefault();
//
//       const br = document.createElement("br");
//       br.id = "new";
//
//       const containerIsBR = range.commonAncestorContainer.nodeName === "BR";
//
//       if (!containerIsBR) {
//         range.insertNode(br);
//       }
//
//       if (
//         br.previousSibling?.nodeType === Node.TEXT_NODE &&
//         (br.nextSibling?.nodeValue?.length === undefined || br.nextSibling?.nodeValue?.length < 1)
//       ) {
//         const extraBr = document.createElement("br");
//         extraBr.id = "extra";
//         br.after(extraBr);
//         selection?.setPosition(extraBr);
//       } else if (containerIsBR) {
//         (range.commonAncestorContainer as Element).after(br);
//         selection?.setPosition(br);
//       } else {
//         selection?.setPosition(br.nextSibling);
//       }
//     }
//
//     if (e.key === "Backspace") {
//       const parent = selectCursorParent();
//
//       if (parent?.textContent?.length === 1) {
//         e.preventDefault();
//         parent.innerHTML = "<br/>";
//       }
//     }
//
//     function holdAnEmptyLine() {
//       e.preventDefault();
//       e.currentTarget.innerHTML = initialHTMLLine;
//
//       selection?.setPosition(element.children[0]!);
//     }
//
//     if (e.key === "Backspace" && element.textContent === "" && element.children.length === 1) {
//       holdAnEmptyLine();
//     }
//
//     if (e.key === "Backspace" && e.metaKey) {
//       holdAnEmptyLine();
//     }
//
//     if (e.key === "Backspace" && e.altKey && element.textContent && element.textContent.split(" ").length < 2) {
//       holdAnEmptyLine();
//     }
//   }
//
//   function handleInput(e: React.FormEvent<HTMLDivElement>) {
//     const value = e.currentTarget.innerText;
//     setHtmlContent(value);
//   }
//
//   function highlightText(text: string) {
//     if (text.length === 0) {
//       return "<br/>";
//     }
//
//     const hashtagPattern = /#(\w+)/g;
//     const mentionPattern = /@(\w+)/g;
//
//     // Split text into lines to handle line breaks
//     const lines = text.split("\n");
//
//     const highlightedLines = lines.map((line) => {
//       // Replace hashtags and mentions with highlighted spans
//       const highlightedLine = line
//         .replace(hashtagPattern, '<span class="text-blue-500" data-lexical-text="true">#$1</span>')
//         .replace(mentionPattern, '<span class="text-blue-500" data-lexical-text="true">@$1</span>');
//
//       // Split by the highlighted parts to wrap normal text in spans
//       const parts = highlightedLine.split(/(<span.*?<\/span>)/g);
//
//       // Wrap normal text parts in spans
//       const wrappedParts = parts.map((part) => {
//         if (part.match(/<span.*?<\/span>/)) {
//           return part;
//         }
//         return part ? `<span data-lexical-text="true">${part}</span>` : "";
//       });
//
//       return wrappedParts.join("");
//     });
//
//     // Filter out empty lines and join with <br> to form the final HTML string
//     const result = highlightedLines.filter((line) => line.trim() !== "").join("<br>");
//
//     return result;
//   }
//
//   useEffect(() => {
//     if (contentEditableRef.current) {
//       contentEditableRef.current.focus();
//     }
//   }, []);
//
//   useEffect(() => {
//     if (contentEditableRef.current) {
//       const el = contentEditableRef.current;
//       const p = el.childNodes[0] as HTMLParagraphElement;
//       const cursorPosition = saveCursorPosition(el);
//
//       console.log("~ line text", p.innerText);
//       p.innerHTML = highlightText(p.innerText);
//
//       restoreCursorPosition(el, cursorPosition);
//     }
//   }, [htmlContent]);
//
//   return (
//     <div
//       ref={contentEditableRef}
//       contentEditable
//       suppressContentEditableWarning={true}
//       onKeyDown={handleKeyDown}
//       onInput={handleInput}
//       className="h-full w-full border border-gray-300 outline-none"
//     >
//       <p className="whitespace-pre-wrap">
//         <br />
//       </p>
//     </div>
//   );
// }
//
// function selectCursorParent() {
//   const selection = window.getSelection();
//
//   if (!selection || selection.rangeCount === 0) return;
//
//   const range = selection.getRangeAt(0);
//   const startNode = range.startContainer;
//   const endNode = range.endContainer;
//
//   const lineRange = document.createRange();
//
//   lineRange.setStartBefore(startNode);
//   lineRange.setEndAfter(endNode);
//
//   let element: HTMLElement | null = startNode as HTMLElement;
//
//   if (element.nodeType === Node.TEXT_NODE) {
//     element = startNode.parentElement;
//   }
//
//   const isALineDiv = element?.tagName === "div";
//
//   if (isALineDiv) {
//     element = (element?.children[0] as HTMLElement) ?? null;
//   }
//
//   return element;
// }
//
// const saveCursorPosition = (el: HTMLElement): CursorPosition | null => {
//   const selection = window.getSelection();
//
//   if (!selection || selection.rangeCount === 0) return null;
//
//   const range = selection.getRangeAt(0);
//   const preCaretRange = range.cloneRange();
//
//   preCaretRange.selectNodeContents(el);
//   preCaretRange.setEnd(range.startContainer, range.startOffset);
//
//   const start = preCaretRange.toString().length;
//
//   return {
//     start,
//     end: start + range.toString().length,
//   };
// };
//
// function restoreCursorPosition(el: HTMLElement, positions: CursorPosition | null) {
//   if (!positions) return;
//
//   function createRange(node: Node, chars: { count: number }): { node: Node; offset: number } | null {
//     if (!node || chars.count === 0) return { node, offset: 0 };
//
//     if (node.nodeType === Node.TEXT_NODE) {
//       const length = node.textContent?.length || 0;
//
//       if (chars.count <= length) {
//         return { node, offset: chars.count };
//       } else {
//         chars.count -= length;
//       }
//     } else if (node.nodeType === Node.ELEMENT_NODE) {
//       for (let i = 0; i < node.childNodes.length; i++) {
//         const result = createRange(node.childNodes[i], chars);
//         if (result) {
//           return result;
//         }
//       }
//     }
//
//     return null;
//   }
//
//   function setCursorPosition(el: HTMLElement, cursorPosition: CursorPosition) {
//     const selection = window.getSelection();
//
//     if (!selection) return;
//
//     const start = createRange(el, { count: cursorPosition.start });
//     const end = createRange(el, { count: cursorPosition.end });
//
//     if (start && end) {
//       const range = document.createRange();
//
//       range.setStart(start.node, start.offset);
//       range.setEnd(end.node, end.offset);
//
//       selection.removeAllRanges();
//       selection.addRange(range);
//     }
//   }
//
//   setCursorPosition(el, positions);
// }
