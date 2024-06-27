import { useRef } from "react";
import { Cancel01Icon } from "./icons/hugeicons";
import { Button } from "./ui/button";

export type Resource = {
  base64: string;
  size: { width: number; height: number };
};

type Props = {
  images: Resource[];
  setImages: React.Dispatch<React.SetStateAction<Resource[]>>;
};

export function UploadedAlbumCarousel({ images, setImages }: Props) {
  const pointX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="ml-3 h-[220px] overflow-hidden">
      <div
        ref={containerRef}
        className="relative h-60 overflow-x-scroll"
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
          }
        }}
        onPointerUp={() => {
          if (pointX.current) {
            pointX.current = null;
          }
        }}
        onPointerLeave={() => (pointX.current = null)}
      >
        <div className="absolute left-0 top-0 flex w-max gap-4 active:cursor-grabbing">
          {images?.map((image, idx) => (
            <div key={idx} className="relative">
              <DeleteButton index={idx} image={image} setImages={setImages} />
              <figure>
                <img
                  src={image.base64}
                  width={image.size.width * 0.4}
                  height={image.size.height * 0.4}
                  alt="Profile picture"
                  draggable="false"
                  style={{
                    width:
                      image.size.width > image.size.height
                        ? `calc(${containerRef.current?.clientWidth! / 2}px - 8px)`
                        : "9rem",
                  }}
                  className="pointer-events-none h-52 select-none rounded-xl"
                />
              </figure>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UploadedAlbumDouble({ images, setImages }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="ml-3">
      <div className="flex w-max gap-4 active:cursor-grabbing">
        {images?.map((image, idx) => (
          <div key={idx} className="relative">
            <DeleteButton index={idx} image={image} setImages={setImages} />
            <figure>
              <img
                src={image.base64}
                width={image.size.width * 0.4}
                height={image.size.height * 0.4}
                alt="Profile picture"
                draggable="false"
                style={{
                  width: `${containerRef.current?.clientWidth! * 0.5 - 8}px`,
                }}
                className="pointer-events-none h-full max-h-96 select-none rounded-xl"
              />
            </figure>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UploadedSingleView({ images, setImages }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const image = images[0];
  const imageWidth = image.size.width * 0.15;
  const imageHeight = image.size.height * 0.15;
  const resizeImageWidth = imageWidth < 100 && imageWidth < imageHeight ? image.size.width * 0.3 : imageWidth;
  const resizeImageHeight = imageWidth < imageHeight ? image.size.height * 0.3 : imageHeight;
  const width = image.size.width > image.size.height ? "100%" : `${resizeImageWidth}px`;
  const height = image.size.width > image.size.height ? "100%" : `${resizeImageHeight}px`;

  return (
    <div ref={containerRef} className="ml-3">
      <div className="flex gap-4">
        <figure className="relative">
          <DeleteButton index={0} image={image} setImages={setImages} />
          <img
            src={image.base64}
            width={resizeImageWidth}
            height={resizeImageHeight}
            alt="Profile picture"
            draggable="false"
            style={{
              width,
              height,
              // width:
              //   image.size.width > image.size.height ? `calc(${containerRef.current?.clientWidth!}px - 8px)` : "9rem",
            }}
            className="pointer-events-none max-h-[520px] max-w-full select-none rounded-xl object-cover"
          />
        </figure>
      </div>
    </div>
  );
}

type ButtonProps = {
  index: number;
  image: Resource;
  setImages: React.Dispatch<React.SetStateAction<Resource[]>>;
};

function DeleteButton({ index, image, setImages }: ButtonProps) {
  return (
    <Button
      variant="secondary"
      type="button"
      size="icon"
      disabled={image == undefined}
      className="absolute right-2 top-2 h-6 w-6 rounded-full opacity-70 transition-all active:scale-95"
      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== index))}
    >
      <Cancel01Icon width={14} height={14} strokeWidth={2.5} className="h-3.5 w-3.5" />
    </Button>
  );
}
