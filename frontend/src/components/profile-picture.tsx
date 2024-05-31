import { Cancel01Icon } from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { MouseEvent, useEffect, useState } from "react";

type Props = {
  src: {
    sm: string;
    lg: string;
  };
  alt: string;
};

export default function ProfilePicture({ src, alt }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const body = document.querySelector("body");

    if (!body) return;

    if (open) {
      body.style.height = "100svh";
      body.style.overflow = "hidden";
    } else {
      body.style.height = "auto";
      body.style.overflow = "visible";
    }
  }, [open]);

  const handleOnClick = <T,>(e: MouseEvent<T, globalThis.MouseEvent>, value: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    setOpen(value);
  };

  return (
    <>
      <button
        id="button-container"
        type="button"
        data-open={open}
        className="relative z-10 h-[84px] w-[84px] rounded-full transition-transform active:scale-95"
        onClick={(e) => handleOnClick(e, true)}
      >
        <img
          id="profile-picture"
          src={src.sm}
          width={84}
          height={84}
          data-open={open}
          // @ts-ignore
          fetchpriority="high"
          className="h-[84px] w-[84px] rounded-full border border-muted-foreground/70 transition-all dark:border-muted-foreground sm:h-[84px] sm:w-[84px]"
          alt={alt}
        />
      </button>
      <div
        id="open-container"
        data-open={open}
        className="pointer-events-none invisible absolute left-0 top-0 z-40 flex h-svh w-full items-center justify-center bg-background/30 opacity-0 backdrop-blur-xl transition-all data-[open=true]:pointer-events-auto data-[open=true]:visible data-[open=true]:opacity-100"
        onClick={(e) => handleOnClick(e, false)}
      >
        <Button
          className="absolute left-8 top-8 h-fit w-fit scale-100 rounded-full bg-secondary-foreground/40 p-2 transition-all hover:scale-110 hover:bg-secondary-foreground/50 active:scale-100"
          onClick={(e) => handleOnClick(e, false)}
        >
          <Cancel01Icon width={28} height={28} strokeWidth={2.5} className="h-5 w-5 sm:h-7 sm:w-7" />
        </Button>
        <img
          id="profile-picture"
          src={src.lg}
          width={224}
          height={224}
          data-open={open}
          className="h-56 w-56 scale-[.8] rounded-full shadow-xl transition-all delay-75 duration-300 data-[open=true]:scale-100 dark:border-muted-foreground"
          // @ts-ignore
          fetchpriority="high"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          alt={alt}
        />
      </div>
    </>
  );
}
