import { useEffect, useRef, useState } from "react";

type CursorPosition = {
  start: number;
  end: number;
};

export function Editor() {
  const [text, setText] = useState("");
  const [insertKey, setInsertKey] = useState("");
  const contentEditableRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    setInsertKey(e.key);
  }

  function handleInput(e: React.FormEvent<HTMLDivElement>) {
    setText(e.currentTarget.innerText);
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

    return `<p class="whitespace-pre-wrap">${result}</p>`;
  }

  useEffect(() => {
    if (contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  }, []);

  useEffect(() => {
    console.log("~ text >>>", text);

    if (contentEditableRef.current) {
      const el = contentEditableRef.current;
      const cursorPosition = saveCursorPosition(el);

      el.innerHTML = highlightText(text);

      restoreCursorPosition(el, cursorPosition);

      if (insertKey === "Enter") {
        moveCursorOneLineDown();
      }
    }
  }, [text]);

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

/// TODO: the enter and backspace keys have bugs. But we are more close than other times.

// function getCurrentLineNumber(): number {
//   const selection = window.getSelection();
//
//   if (!selection || selection.rangeCount === 0) return 1; // Default to line 1 if no selection
//
//   const range = selection.getRangeAt(0);
//   const startContainer = range.startContainer;
//
//   if (!startContainer) return 1; // Default to line 1 if no start container
//
//   let lineNumber = 1;
//   let currentNode: Node | null = startContainer.parentNode;
//
//   // Traverse up the DOM tree from the start container to the contentEditable element
//   while (currentNode && currentNode !== document.body) {
//     if (currentNode.nodeName === 'DIV' && currentNode.isSameNode(contentEditableRef.current)) {
//       break; // Break if we reach the contentEditable element
//     }
//     if (currentNode.nodeName === 'BR') {
//       lineNumber++;
//     }
//     currentNode = currentNode.parentNode;
//   }
//
//   return lineNumber;
// }

function moveCursorOneLineDown() {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);

  console.log("~ selection", selection);
  console.log("~ range", range);
}

function saveCursorPosition(el: HTMLElement): CursorPosition | null {
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
}

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

  const selection = window.getSelection();
  if (!selection) return;

  const start = createRange(el, { count: positions.start });
  const end = createRange(el, { count: positions.end });

  if (start && end) {
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);

    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// function moveCursorOneLineDown() {
//   const selection = window.getSelection();
//
//   if (!selection || selection.rangeCount === 0) return;
//
//   const range = selection.getRangeAt(0);
//   const currentNode = range.startContainer;
//   const currentOffset = range.startOffset;
//
//   let nextNode: Node | null = currentNode;
//   let nextOffset = currentOffset;
//
//   console.log("~ range", range);
//   console.log("~ current node", currentNode);
//   console.log("~ current offset", currentOffset);
//   console.log("~ next node", currentNode.nextSibling);
//
//   // if (currentNode.nodeType === Node.TEXT_NODE) {
//   //   // If we're at a text node, check for newlines and move to the next line if found
//   //   const parentNode = currentNode.parentNode;
//   //   let foundNewline = false;
//   //
//   //   while (nextNode && !foundNewline) {
//   //     if (nextNode.nodeType === Node.TEXT_NODE) {
//   //       nextOffset = nextNode.textContent?.length || 0;
//   //       nextNode = nextNode.nextSibling;
//   //     }
//   //
//   //     if (nextNode && nextNode.nodeType === Node.TEXT_NODE && nextNode.textContent?.includes("\n")) {
//   //       foundNewline = true;
//   //       nextOffset = (nextNode.textContent?.indexOf("\n") || 0) + 1;
//   //       if (nextNode instanceof Text) {
//   //         nextNode = nextNode.splitText(nextOffset);
//   //       }
//   //     }
//   //   }
//   //
//   //   if (!foundNewline && parentNode) {
//   //     nextNode = parentNode.nextSibling;
//   //     nextOffset = 0;
//   //   }
//   // } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
//   //   // If current node is an element, check if it's a BR or empty element and handle accordingly
//   //   if (currentNode.nodeName === "BR" || (currentNode as HTMLElement).innerText === "") {
//   //     nextNode = currentNode.nextSibling;
//   //   } else {
//   //     nextNode = currentNode.childNodes[currentOffset] || currentNode.nextSibling;
//   //   }
//   // }
//   //
//   // // If nextNode is not a text node, find the next text node or a BR element
//   // while (nextNode && nextNode.nodeType !== Node.TEXT_NODE && nextNode.nodeName !== "BR") {
//   //   nextNode = nextNode.firstChild || nextNode.nextSibling;
//   // }
//   //
//   // if (!nextNode) {
//   //   return;
//   // }
//   //
//   // // If the next node is a BR element, adjust the cursor position
//   // if (nextNode.nodeName === "BR") {
//   //   nextOffset = 0;
//   // }
//   //
//   // // Set the cursor position to the next node and offset
//   // const newRange = document.createRange();
//   // newRange.setStart(nextNode, nextOffset);
//   // newRange.collapse(true);
//   //
//   // selection.removeAllRanges();
//   // selection.addRange(newRange);
// }

// function saveCursorPosition(el: HTMLElement): CursorPosition | null {
//   const selection = window.getSelection();
//
//   if (!selection || selection.rangeCount === 0) return null;
//
//   const range = selection.getRangeAt(0);
//   const preCaretRange = range.cloneRange();
//   preCaretRange.selectNodeContents(el);
//   preCaretRange.setEnd(range.startContainer, range.startOffset);
//
//   const start = preCaretRange.toString().length;
//
//   return {
//     start,
//     end: start + range.toString().length,
//   };
// }
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
//   setCursorPosition(el, positions);
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
//       range.setStart(start.node, start.offset);
//       range.setEnd(end.node, end.offset);
//
//       selection.removeAllRanges();
//       selection.addRange(range);
//     }
//   }
// }
