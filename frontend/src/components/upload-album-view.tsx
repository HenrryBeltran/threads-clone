import { useRef } from "react";
import { Cancel01Icon } from "./icons/hugeicons";
import { Button } from "./ui/button";

export type Resource = {
  base64: string;
  size: { width: number; height: number };
};

type Props = {
  images?: Resource[];
  setImages: React.Dispatch<React.SetStateAction<Resource[] | undefined>>;
};

// TODO: See if I can add some velocity when your dragging the carousel
export function UploadAlbumView({ images, setImages }: Props) {
  // const initialVelocity = useRef<number | null>(null);
  // const finalVelocity = useRef<number | null>(null);
  const pointX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-[220px] overflow-hidden border-2 border-orange-500">
      <div
        ref={containerRef}
        className="relative h-60 overflow-x-scroll border-2 border-purple-500"
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;

          pointX.current = x;
        }}
        onPointerMove={(e) => {
          if (pointX.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const delta = pointX.current - x;

            e.currentTarget.scrollLeft += delta;
            pointX.current = x;

            console.log("~ delta", delta);
          }
        }}
        onPointerUp={(e) => {
          if (pointX.current) {
            pointX.current = null;
          }
        }}
      >
        <div className="absolute left-0 top-0 flex w-max gap-4 border-2 border-cyan-500 active:cursor-grabbing">
          {images?.map((image, idx) => (
            <div key={idx} className="relative">
              <Button
                variant="outline"
                type="button"
                size="icon"
                disabled={image == undefined}
                className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-70 transition-all active:scale-95"
                onClick={() => {
                  // TODO: check if I need this
                  // if (ref.current) {
                  //   ref.current.value = "";
                  // }
                  setImages((prev) => prev?.filter((_, index) => index !== idx));
                }}
              >
                <Cancel01Icon width={16} height={16} strokeWidth={2.5} className="h-4 w-4" />
              </Button>
              {/* <figure className="border border-red-500"> */}
              <img
                src={image.base64}
                width={image.size.width * 0.4}
                height={image.size.height * 0.4}
                alt="Profile picture"
                style={{
                  width:
                    image.size.width > image.size.height
                      ? `calc(${containerRef.current?.clientWidth! / 2}px - 8px)`
                      : "9rem",
                }}
                className="pointer-events-none h-52 select-none rounded-xl border border-muted-foreground/30 object-cover"
              />
              {/* </figure> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
