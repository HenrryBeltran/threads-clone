import { Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

type Props = {
  text: string;
  author: string;
  postId: string;
};

export function Paragraph({ text, author, postId }: Props) {
  const navigate = useNavigate();
  const pointerDown = useRef(false);
  const itMove = useRef(false);

  function highlightText(text: string) {
    const mentionPattern = /@(\w+)/g;
    const hashtagPattern = /#(\w+)/g;

    const mentionLines = text.split(mentionPattern);

    return mentionLines.map((line, idx) => {
      if (!line.includes(" ") && line.length > 1) {
        return (
          <Link key={idx} to={`/@${line}`} className="text-blue-500 dark:text-blue-400" data-lexical-text="true">
            {line}
          </Link>
        );
      }

      if (line.match(hashtagPattern)) {
        const hasthagLines = line.split(hashtagPattern);

        return hasthagLines.map((hashtagLine, idx) => {
          if (!hashtagLine.includes(" ") && hashtagLine.length > 1) {
            return (
              <Link
                key={idx}
                to={`/search?h=${hashtagLine}`}
                className="text-blue-500 dark:text-blue-400"
                data-lexical-text="true"
              >
                #{hashtagLine}
              </Link>
            );
          }

          return hashtagLine;
        });
      }

      return line;
    });
  }

  return (
    <p
      className="cursor-pointer whitespace-pre-wrap leading-snug"
      onPointerDown={() => (pointerDown.current = true)}
      onPointerMove={() => {
        if (pointerDown.current) {
          itMove.current = true;
        }
      }}
      onPointerUp={() => (pointerDown.current = false)}
      onClick={() => {
        if (!itMove.current) {
          navigate({ to: `/@${author}/post/${postId}` });
          return;
        }
        itMove.current = false;
      }}
    >
      {highlightText(text)}
    </p>
  );
}
