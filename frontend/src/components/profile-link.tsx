import { shortUrl } from "@/lib/utils";

export function ProfileLink({ link }: { link: string | null }) {
  return (
    <>
      {link && (
        <>
          <span className="text-sm font-light text-muted-foreground">•</span>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-light text-muted-foreground hover:underline hover:underline-offset-2"
          >
            {shortUrl(link)}
          </a>
        </>
      )}
    </>
  );
}
