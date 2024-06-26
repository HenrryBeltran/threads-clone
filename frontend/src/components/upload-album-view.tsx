import { useRef } from "react";
import { Cancel01Icon } from "./icons/hugeicons";
import { Button } from "./ui/button";

export type Resource = {
  base64: string;
  size: { width: number; height: number };
};

type Props = {
  containerWidth: number;
  images: Resource[];
  setImages: React.Dispatch<React.SetStateAction<Resource[]>>;
};

export function UploadedAlbumCarousel({ containerWidth, images, setImages }: Props) {
  const pointX = useRef<number | null>(null);

  return (
    <div className="ml-3 h-[220px] overflow-hidden">
      <div
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
                    width: image.size.width > image.size.height ? `calc(${containerWidth / 2}px - 8px)` : "9rem",
                  }}
                  className="pointer-events-none h-52 select-none rounded-xl object-cover"
                />
              </figure>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UploadedAlbumDouble({ containerWidth, images, setImages }: Props) {
  return (
    <div className="ml-3">
      <div className="grid w-max grid-cols-2 grid-rows-1 gap-4 active:cursor-grabbing">
        {images?.map((image, idx) => (
          <div key={idx} className="relative flex">
            <DeleteButton index={idx} image={image} setImages={setImages} />
            <figure>
              <img
                src={image.base64}
                width={image.size.width * 0.4}
                height={image.size.height * 0.4}
                alt="Profile picture"
                draggable="false"
                style={{
                  // -8 is for gap, -22 is for the left profile picture, -6 is for the container padding
                  width: `${containerWidth * 0.5 - 8 - 22 - 6}px`,
                }}
                className="pointer-events-none h-full max-h-96 select-none rounded-xl object-cover"
              />
            </figure>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UploadedSingleView({ images, setImages }: Props) {
  const image = images[0];
  const imageWidth = image.size.width * 0.15;
  const imageHeight = image.size.height * 0.15;
  const resizeImageWidth =
    (imageWidth > 150 || imageHeight > 260) && imageWidth < imageHeight ? imageWidth : image.size.width * 0.3;
  const resizeImageHeight =
    (imageWidth > 150 || imageHeight > 260) && imageWidth < imageHeight ? imageHeight : image.size.height * 0.3;
  const width = image.size.width > image.size.height ? "100%" : `${resizeImageWidth}px`;
  const height = image.size.width > image.size.height ? "100%" : `${resizeImageHeight}px`;

  return (
    <div className="ml-3">
      <div className="flex">
        <figure className="relative">
          <DeleteButton index={0} image={image} setImages={setImages} />
          <img
            src={image.base64}
            width={resizeImageWidth}
            height={resizeImageHeight}
            alt="Profile picture"
            draggable="false"
            style={{ width, height }}
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
      className="absolute right-2 top-2 h-7 w-7 rounded-full border border-neutral-700/50 bg-neutral-950/55 text-white transition-all hover:bg-neutral-950/70 active:scale-90"
      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== index))}
    >
      <Cancel01Icon width={16} height={16} strokeWidth={2.5} className="h-4 w-4" />
    </Button>
  );
}
