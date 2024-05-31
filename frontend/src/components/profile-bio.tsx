import { useState } from "react";

export function ProfileBio({ text }: { text: string }) {
  const [readMore, setReadMore] = useState(false);

  return (
    <div className="max-w-[65%] py-4">
      <p id="bio-par" className="line-clamp-3 whitespace-pre-line leading-tight">
        {text}
      </p>
      {text.split(/\r\n|\r|\n/).length > 3 && (
        <span
          className="cursor-pointer text-muted-foreground hover:underline hover:underline-offset-2"
          onClick={() => {
            const bio = document.querySelector("#bio-par");

            if (bio) {
              if (readMore) {
                bio.classList.add("line-clamp-3");
              } else {
                bio.classList.remove("line-clamp-3");
              }

              setReadMore((prev) => !prev);
            }
          }}
        >
          {readMore ? "Show less" : "Read more"}
        </span>
      )}
    </div>
  );
}
