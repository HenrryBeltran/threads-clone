import { Link, useNavigate } from "@tanstack/react-router";

type Props = {
  text: string;
  author: string;
  postId: string;
};

export function Paragraph({ text, author, postId }: Props) {
  const navigate = useNavigate();

  function highlightText(text: string) {
    const mentionPattern = /@(\w+)/g;
    const hashtagPattern = /#(\w+)/g;

    if (text.match(mentionPattern) && !text.match(hashtagPattern)) {
      const mentionLines = text.split(mentionPattern);
      return mentionLines.map((line, idx) => {
        if (!line.includes(" ") && line.length > 1) {
          return (
            <Link
              key={idx}
              to={`/@${line}`}
              className="text-blue-500 dark:text-blue-400"
              data-lexical-text="true"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            >
              {line}
            </Link>
          );
        }
        return (
          <Link
            key={idx}
            to={`/@${author}/post/${postId}`}
            data-lexical-text="true"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          >
            {line}
          </Link>
        );
      });
    }

    if (text.match(hashtagPattern) && !text.match(mentionPattern)) {
      const hasthagLines = text.split(hashtagPattern);
      return hasthagLines.map((line, idx) => {
        if (!line.includes(" ") && line.length > 1 && line.match(/^[a-zA-Z0-9]+$/)) {
          return (
            <Link
              key={idx}
              to={`/search?q=${line}`}
              className="text-blue-500 dark:text-blue-400"
              data-lexical-text="true"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            >
              #{line}
            </Link>
          );
        }

        return (
          <Link
            key={idx}
            to={`/@${author}/post/${postId}`}
            data-lexical-text="true"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          >
            {line}
          </Link>
        );
      });
    }

    if (text.match(mentionPattern) && text.match(hashtagPattern)) {
      const mentionLines = text.split(mentionPattern);
      return mentionLines.map((line, idx) => {
        if (!line.includes(" ") && line.length > 1) {
          return (
            <Link
              key={idx}
              to={`/@${line}`}
              className="text-blue-500 dark:text-blue-400"
              data-lexical-text="true"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            >
              {line}
            </Link>
          );
        }

        if (line.match(hashtagPattern)) {
          const hasthagLines = line.split(hashtagPattern);
          return hasthagLines.map((hashtagLine, idx) => {
            if (!hashtagLine.includes(" ") && hashtagLine.length > 1 && hashtagLine.match(/^[a-zA-Z0-9]+$/)) {
              return (
                <Link
                  key={idx}
                  to={`/search?q=${hashtagLine}`}
                  className="text-blue-500 dark:text-blue-400"
                  data-lexical-text="true"
                  draggable={false}
                  onClick={(e) => e.stopPropagation()}
                >
                  #{hashtagLine}
                </Link>
              );
            }

            return (
              <Link
                key={idx}
                to={`/@${author}/post/${postId}`}
                data-lexical-text="true"
                draggable={false}
                onClick={(e) => e.stopPropagation}
              >
                {hashtagLine}
              </Link>
            );
          });
        }

        return (
          <Link
            key={idx}
            to={`/@${author}/post/${postId}`}
            data-lexical-text="true"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          >
            {line}
          </Link>
        );
      });
    }
    return (
      <Link
        to={`/@${author}/post/${postId}`}
        data-lexical-text="true"
        draggable={false}
        onClick={(e) => e.stopPropagation()}
      >
        {text}
      </Link>
    );
  }

  return (
    <p
      className="cursor-pointer whitespace-pre-wrap leading-snug"
      onClick={() => navigate({ to: `/@${author}/post/${postId}` })}
    >
      {highlightText(text)}
    </p>
  );
}
